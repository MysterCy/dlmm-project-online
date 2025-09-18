# dlmm_app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SumUpFileUploadView,
    CreditAgricoleFileUploadView,
    TransactionListView,
    AllTransactionsListView,
    CategoryListView,
    TransactionViewSet,
    JustificatifUploadView,
    CategoryCreateView,
    LivretAView,
    CategorySpendingView,
    MonthlySummaryView,
    TotalBalanceView,
    StatisticsView,
    TransactionsByCategoryView,
    BudgetSummaryView, # NOUVEL IMPORT
)

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('transactions/<str:account_name>/', TransactionListView.as_view(), name='transaction-list'),
    path('transactions/all/', AllTransactionsListView.as_view(), name='all-transactions-list'),
    path('upload/sumup/', SumUpFileUploadView.as_view(), name='upload-sumup'),
    path('upload/creditagricole/', CreditAgricoleFileUploadView.as_view(), name='upload-creditagricole'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('transactions/<int:pk>/upload_justificatif/', JustificatifUploadView.as_view(), name='upload-justificatif'),
    path('category/create/', CategoryCreateView.as_view(), name='category-create'),
    path('livreta/', LivretAView.as_view(), name='livret-a'),
    path('category-spending/', CategorySpendingView.as_view(), name='category-spending'),
    path('monthly-summary/', MonthlySummaryView.as_view(), name='monthly-summary'),
    path('total-balance/', TotalBalanceView.as_view(), name='total-balance'),
    path('transactions/by-category/', TransactionsByCategoryView.as_view(), name='transactions-by-category'),
    path('statistics/', StatisticsView.as_view(), name='statistics'),
    path('budget/summary/', BudgetSummaryView.as_view(), name='budget-summary'), # NOUVELLE ROUTE
    path('', include(router.urls)),
]