# dlmm_app/views.py
from django.shortcuts import render, get_object_or_404
from rest_framework import generics, status, mixins, viewsets
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.renderers import JSONRenderer

from django.db.models import Sum, F, Case, When, Value, CharField, DecimalField
from django.db.models.functions import Coalesce
from django.db.models.functions import ExtractMonth, ExtractYear
from rest_framework.views import APIView
from collections import defaultdict
from django.db.models import Q

from .models import Transaction, Account, Category, Subcategory, LivretA
from .serializers import (
    SumUpFileUploadSerializer,
    TransactionSerializer,
    AllTransactionSerializer,
    CategorySerializer,
    CategoryCreationSerializer,
    LivretASerializer,
)

import csv
from django.db import transaction as db_transaction
from datetime import datetime
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os

# Vue de téléchargement pour les fichiers SumUp
class SumUpFileUploadView(generics.CreateAPIView):
    serializer_class = SumUpFileUploadSerializer
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        file_obj = serializer.validated_data['file']

        try:
            decoded_file = file_obj.read().decode('utf-8-sig').splitlines()
            reader = csv.DictReader(decoded_file)
            transactions_to_create = []

            sumup_account, created = Account.objects.get_or_create(name='SumUP')

            with db_transaction.atomic():
                for row in reader:
                    date_str = row.get('Date de transaction', '').strip()
                    amount_str = row.get('Montant', '0').replace(',', '.').strip()
                    description = row.get('Détail', '').strip()

                    if not date_str or not description:
                        continue
                    
                    try:
                        date_obj = datetime.strptime(date_str.split(' ')[0], '%Y-%m-%d').date()
                        amount = float(amount_str)

                        transactions_to_create.append(Transaction(
                            account=sumup_account,
                            date=date_obj,
                            description=description,
                            amount=amount,
                        ))
                    except (ValueError, TypeError) as e:
                        print(f"Erreur lors du traitement de la ligne : {row}. Erreur : {e}")
                        continue
            
            if transactions_to_create:
                Transaction.objects.bulk_create(transactions_to_create, ignore_conflicts=True)
                return Response({"message": f"{len(transactions_to_create)} transactions SumUP importées avec succès."}, status=status.HTTP_201_CREATED)

            return Response({"message": "Aucune nouvelle transaction à importer."}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": f"Erreur lors de l'importation: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

# Vue de téléchargement pour les fichiers Crédit Agricole
class CreditAgricoleFileUploadView(generics.CreateAPIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        file_obj = serializer.validated_data['file']

        try:
            decoded_file = file_obj.read().decode('utf-8-sig').splitlines()
            reader = csv.DictReader(decoded_file, delimiter=';')
            transactions_to_create = []

            ca_account, created = Account.objects.get_or_create(name='Crédit Agricole')

            with db_transaction.atomic():
                for row in reader:
                    date_str = row.get('Date', '').strip()
                    amount_str = row.get('Montant', '0').replace(',', '.').strip()
                    description = row.get('Libellé', '').strip()

                    if not date_str or not description:
                        continue

                    try:
                        date_obj = datetime.strptime(date_str, '%d/%m/%Y').date()
                        amount = float(amount_str)

                        transactions_to_create.append(Transaction(
                            account=ca_account,
                            date=date_obj,
                            description=description,
                            amount=amount,
                        ))
                    except (ValueError, TypeError) as e:
                        print(f"Erreur lors du traitement de la ligne : {row}. Erreur : {e}")
                        continue
            
            if transactions_to_create:
                Transaction.objects.bulk_create(transactions_to_create, ignore_conflicts=True)
                return Response({"message": f"{len(transactions_to_create)} transactions du Crédit Agricole importées avec succès."}, status=status.HTTP_201_CREATED)
            
            return Response({"message": "Aucune nouvelle transaction à importer."}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": f"Erreur lors de l'importation: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class TransactionListView(generics.ListAPIView):
    serializer_class = AllTransactionSerializer

    def get_queryset(self):
        account_name = self.kwargs['account_name']
        return Transaction.objects.filter(account__name=account_name).order_by('-date')

class AllTransactionsListView(generics.ListAPIView):
    serializer_class = AllTransactionSerializer

    def get_queryset(self):
        # Récupère toutes les transactions
        queryset = Transaction.objects.all()
        
        # Filtre par l'année si le paramètre 'year' est présent dans l'URL
        year_param = self.request.query_params.get('year')
        if year_param:
            try:
                # Applique le filtre sur le queryset
                queryset = queryset.filter(date__year=int(year_param))
            except ValueError:
                # Ne fait rien si l'année n'est pas un nombre valide,
                # mais le front-end devrait déjà le gérer.
                pass
        
        # Ordonne par date, du plus récent au plus ancien
        return queryset.order_by('-date')

class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = AllTransactionSerializer

class TransactionsByCategoryView(APIView):
    def get(self, request):
        transactions = Transaction.objects.values(
            'category'
        ).annotate(
            category_name=Coalesce('category__name', Value('Non classé')),
            total_amount=Sum('amount')
        ).order_by('category_name')

        data = []
        for item in transactions:
            data.append({
                'category_name': item['category_name'],
                'total_amount': item['total_amount']
            })

        return Response(data)

class JustificatifUploadView(generics.GenericAPIView, mixins.UpdateModelMixin):
    queryset = Transaction.objects.all()
    serializer_class = AllTransactionSerializer
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        transaction = self.get_object()
        file = request.data.get('justificatif')
        
        if file:
            file_name = f'justificatifs/{transaction.id}_{file.name}'
            path = default_storage.save(file_name, ContentFile(file.read()))
            transaction.justificatif = path
            transaction.save()
            return Response(self.get_serializer(transaction).data, status=status.HTTP_200_OK)
        return Response({"message": "Aucun fichier fourni."}, status=status.HTTP_400_BAD_REQUEST)

class CategoryCreateView(generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategoryCreationSerializer

class CategorySpendingView(APIView):
    def get(self, request):
        spendings = Transaction.objects.filter(
            amount__lt=0,
            category__isnull=False
        ).values('category__name').annotate(
            total_spending=Sum('amount')
        ).order_by('category__name')
        
        data = [{'category': item['category__name'], 'total': abs(item['total_spending'])} for item in spendings]
        return Response(data)

class MonthlySummaryView(APIView):
    def get(self, request):
        transactions_by_month = Transaction.objects.annotate(
            year=ExtractYear('date'),
            month=ExtractMonth('date')
        ).values('year', 'month').annotate(
            total_income=Sum(Case(When(amount__gt=0, then=F('amount')))),
            total_expense=Sum(Case(When(amount__lt=0, then=F('amount'))))
        ).order_by('year', 'month')

        monthly_data = []
        for item in transactions_by_month:
            monthly_data.append({
                'month': f"{item['year']}-{item['month']:02d}",
                'income': item['total_income'] or 0,
                'expense': abs(item['total_expense'] or 0)
            })
        return Response(monthly_data)

class TotalBalanceView(APIView):
    renderer_classes = [JSONRenderer]
    
    def get(self, request):
        all_transactions = Transaction.objects.all().order_by('date')
        balance = 0
        balance_history = []
        for transaction in all_transactions:
            balance += transaction.amount
            balance_history.append({
                'date': transaction.date,
                'balance': balance
            })
        return Response(balance_history)

class LivretAView(generics.ListCreateAPIView):
    queryset = LivretA.objects.all().order_by('-date')
    serializer_class = LivretASerializer

class StatisticsView(APIView):
    def get(self, request):
        transactions = Transaction.objects.all()
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        categories_to_filter = request.query_params.getlist('categories')

        if year:
            transactions = transactions.filter(date__year=year)
        if month:
            transactions = transactions.filter(date__month=month)
        
        if categories_to_filter:
            q_objects = Q()
            for cat_or_subcat_name in categories_to_filter:
                if '-' in cat_or_subcat_name:
                    parent_category, subcategory = cat_or_subcat_name.split('-', 1)
                    q_objects |= Q(category__name=parent_category, subcategory__name=subcategory)
                else: 
                    q_objects |= Q(category__name=cat_or_subcat_name)
            transactions = transactions.filter(q_objects)

        category_data = defaultdict(lambda: {
            'name': '',
            'is_revenue': False,
            'total': 0,
            'subcategories': {}
        })

        for transaction in transactions:
            category_name = transaction.category.name if transaction.category else 'Non classé'
            subcategory_name = transaction.subcategory.name if transaction.subcategory else 'Non défini'
            amount = transaction.amount
            is_revenue = amount > 0

            cat = category_data[category_name]
            cat['name'] = category_name
            cat['is_revenue'] = cat['is_revenue'] or is_revenue
            cat['total'] += amount

            subcat = cat['subcategories'][subcategory_name] = cat['subcategories'].get(subcategory_name, {
                'name': subcategory_name,
                'total': 0
            })
            subcat['total'] += amount
            subcat['is_revenue'] = subcat.get('is_revenue', is_revenue) or is_revenue

        final_categories_data = []
        for cat_name, cat_obj in category_data.items():
            cat_obj['subcategories'] = list(cat_obj['subcategories'].values())
            final_categories_data.append(cat_obj)
        
        revenues_total = transactions.filter(amount__gt=0).aggregate(total=Coalesce(Sum('amount'), Value(0), output_field=DecimalField()))['total']
        expenses_total = transactions.filter(amount__lt=0).aggregate(total=Coalesce(Sum('amount'), Value(0), output_field=DecimalField()))['total']

        return Response({
            'expenses_total': abs(expenses_total),
            'revenues_total': revenues_total,
            'categories_data': final_categories_data
        })
    
class BudgetSummaryView(APIView):
    def get(self, request):
        year = self.request.query_params.get('year')

        if not year:
            return Response({"error": "Year parameter is required."}, status=400)
        
        try:
            transactions = Transaction.objects.filter(date__year=int(year))
        except ValueError:
            return Response({"error": "Invalid year format."}, status=400)

        aggregated_data = transactions.values(
            'category__name', 
            'subcategory__name'
        ).annotate(
            actual=Coalesce(Sum('amount'), Value(0), output_field=DecimalField())
        )
        
        if not aggregated_data:
            return Response({}, status=200)

        data_for_frontend = {}
        for item in aggregated_data:
            category_name = item['category__name'] or 'Sans Catégorie'
            subcategory_name = item['subcategory__name'] or 'Non défini'
            
            if category_name not in data_for_frontend:
                data_for_frontend[category_name] = {}
            
            data_for_frontend[category_name][subcategory_name] = {
                'actual': item['actual']
            }

        return Response(data_for_frontend)