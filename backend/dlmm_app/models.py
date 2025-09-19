# dlmm_app/models.py
from django.db import models

class Account(models.Model):
    name = models.CharField(max_length=100, unique=True)
    currency = models.CharField(max_length=3, default='EUR')
    initial_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    is_revenue = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name

class Subcategory(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')

    class Meta:
        unique_together = ('name', 'category',)

    def __str__(self):
        return f"{self.name} ({self.category.name})"

class Transaction(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    date = models.DateField()
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    justificatif = models.FileField(upload_to='justificatifs/', blank=True, null=True)

    # NOUVEAU : Le champ est maintenant optionnel
    subcategory = models.ForeignKey(Subcategory, on_delete=models.SET_NULL, null=True, blank=True)
    
    is_reconciled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.date} - {self.description} - {self.amount}"
    
    @property
    def category_name(self):
        return self.subcategory.category.name if self.subcategory else None

    @property
    def subcategory_name(self):
        return self.subcategory.name if self.subcategory else None
    
class LivretA(models.Model):
    date = models.DateField()
    label = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.date} - {self.label} - {self.amount}"