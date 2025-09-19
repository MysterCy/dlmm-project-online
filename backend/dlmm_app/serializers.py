# dlmm_app/serializers.py
from rest_framework import serializers
from .models import Transaction, Category, Subcategory, Account, LivretA

class SumUpFileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

class CreditAgricoleFileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    
class TransactionSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'date', 'description', 'amount', 'account_name', 'justificatif', 'is_reconciled']
        
class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'is_revenue', 'subcategories']

    def get_subcategories(self, obj):
        from .serializers import SubcategorySerializer
        subcategories = obj.subcategories.all()
        return SubcategorySerializer(subcategories, many=True).data

class SubcategorySerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Category.objects.all()
    )

    class Meta:
        model = Subcategory
        fields = ['id', 'name', 'category']

class AllTransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category_name', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory_name', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'date', 'description', 'amount', 'account_name', 'category_name', 'subcategory_name', 'justificatif', 'subcategory']
        read_only_fields = ['category_name', 'account_name', 'subcategory_name']

class CategoryCreationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'is_revenue']

class SubcategoryCreationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategory
        fields = ['id', 'name', 'category']

class LivretASerializer(serializers.ModelSerializer):
    class Meta:
        model = LivretA
        fields = '__all__'

from rest_framework import serializers

class StatisticsSerializer(serializers.Serializer):
    category = serializers.CharField(required=False)
    month = serializers.CharField(required=False)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)