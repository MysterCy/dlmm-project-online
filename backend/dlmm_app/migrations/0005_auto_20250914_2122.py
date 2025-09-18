# dlmm_app/migrations/0005_auto_20250914_2122.py
from django.db import migrations

def assign_category_to_sumup_transactions(apps, schema_editor):
    Transaction = apps.get_model('dlmm_app', 'Transaction')
    Category = apps.get_model('dlmm_app', 'Category')
    
    # Crée ou récupère la catégorie "Vente Boutique"
    try:
        vente_boutique_category = Category.objects.get(name="Vente Boutique")
    except Category.DoesNotExist:
        vente_boutique_category = Category.objects.create(name="Vente Boutique")

    # Met à jour les transactions existantes
    transactions_to_update = Transaction.objects.filter(description__startswith='Paiement entrant SumUp')
    for transaction in transactions_to_update:
        transaction.category = vente_boutique_category
        transaction.save()

class Migration(migrations.Migration):

    dependencies = [
        ('dlmm_app', '0004_alter_transaction_category_and_more'),
    ]

    operations = [
        migrations.RunPython(assign_category_to_sumup_transactions),
    ]