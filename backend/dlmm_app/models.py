# dlmm_app/models.py
from django.db import models

# Modèle pour les différents comptes (SumUp, Crédit Agricole, etc.)
class Account(models.Model):
    # Le nom du compte, comme 'SumUp' ou 'Crédit Agricole'
    name = models.CharField(max_length=100, unique=True)
    # La devise du compte (par défaut 'EUR')
    currency = models.CharField(max_length=3, default='EUR')
    # Le solde initial du compte
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

# Modèle pour les transactions financières
class Transaction(models.Model):
    # Clé étrangère vers le modèle Account, cela lie chaque transaction à un compte
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    # La date de la transaction
    date = models.DateField()
    # Le libellé ou la description de l'opération
    description = models.CharField(max_length=255)
    # Le montant de la transaction. Utilisation de DecimalField pour la précision des calculs monétaires
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    # MODIFIÉ : La catégorisation de la transaction, liée au modèle Category
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    subcategory = models.ForeignKey(Subcategory, on_delete=models.SET_NULL, null=True, blank=True)
    # Permet de lier un fichier justificatif à la transaction (le chemin sera stocké)
    justificatif = models.FileField(upload_to='justificatifs/', blank=True, null=True)

    def __str__(self):
        # Affiche la transaction sous forme lisible
        return f"{self.date} - {self.description} - {self.amount}"
    
class LivretA(models.Model):
    date = models.DateField()
    label = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return self.label