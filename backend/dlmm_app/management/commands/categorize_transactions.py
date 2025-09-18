import os
import django
from django.core.management.base import BaseCommand

# Configuration de l'environnement Django
# (Cette partie est gérée par manage.py)

from dlmm_app.models import Transaction, Category, Subcategory

# --- Vous pouvez modifier les mots-clés ci-dessous ---

# 1. Dictionnaire qui associe une SOUS-CATÉGORIE à une liste de mots-clés.
# Si vous ajoutez de nouveaux mots, assurez-vous de les placer dans la bonne sous-catégorie.
SUBCATEGORY_KEYWORDS = {
    "Intérêts": ["interets"],
    "Tenue de Compte": ["tenue de compte"],
    "Frais de Compte": ["frais de compte", "abonnement banque"],
    "Remboursement": ["remboursement", "retro"],
    "Don": ["don", "dons", "donateur"],
    "Yapla": ["yapla", "adhésion", "adhésions"],
    "Matières premières": ["matières premières", "cplt", "france frais", "sicodis", "patrickfruits", "cafés", "tout fruit", "orlienas", "legumes"],
    "Marchandises": ["marchandises", "leclerc", "metro", "amazon", "amzn", "centrakor", "tavenard", "berat", "baumalu", "firsplast", "vetementpro", "latelier"],
    "Bocaux": ["bocaux", "paypal"],
    "Fournitures": ["fournitures", "temu", "ikea", "autocollant"],
    "Autres (Achats)": ["autres", "divers"],
    "Local Feyzin": ["local feyzin", "la begude", "loyer"],
    "Assurances": ["assurances", "assurance"],
    "Eau": ["eau du grand lyon"],
    "Electricité": ["electricite"],
    "Box Internet": ["box internet", "bouygues", "wifi"],
    "Téléphone": ["téléphone", "téléphonie"],
    "Autres (Charges)": ["autres charges"],
    "Salons": ["salons", "salon"],
    "Marchés": ["marchés"],
    "Foires": ["foires"],
    "Prestations (Frais)": ["prestations", "formation", "frais de service", "commission"],
    "Boutique": ["boutique", "payout"],
    "Marchés de Noël": ["marchés de noël"],
    "Foire ou Forum": ["foire", "forum"],
    "Prestations (Ventes)": ["prestations", "shopping", "service"],
    "A distance, Site": ["a distance", "site"]
}

# 2. Dictionnaire qui associe une SOUS-CATÉGORIE à sa CATÉGORIE principale.
# Ajoutez ici toute nouvelle sous-catégorie que vous avez créée.
SUBCATEGORY_TO_CATEGORY = {
    "Intérêts": "Frais Bancaires",
    "Frais de Compte": "Frais Bancaires",
    "Tenue de Compte": "Frais Bancaires",
    "Remboursement": "Frais Bancaires",
    "Don": "DONS",
    "Yapla": "Adhésions",
    "Matières premières": "Achats",
    "Marchandises": "Achats",
    "Bocaux": "Achats",
    "Fournitures": "Achats",
    "Autres (Achats)": "Achats",
    "Local Feyzin": "Charges et Abonnements",
    "Assurances": "Charges et Abonnements",
    "Eau": "Charges et Abonnements",
    "Electricité": "Charges et Abonnements",
    "Box Internet": "Charges et Abonnements",
    "Téléphone": "Charges et Abonnements",
    "Autres (Charges)": "Charges et Abonnements",
    "Salons": "Frais",
    "Marchés": "Frais",
    "Foires": "Frais",
    "Prestations (Frais)": "Frais",
    "Boutique": "Ventes",
    "Marchés de Noël": "Ventes",
    "Foire ou Forum": "Ventes",
    "Prestations (Ventes)": "Ventes",
    "A distance, Site": "Ventes"
}

class Command(BaseCommand):
    help = 'Catégorise les transactions non classées en se basant sur les mots-clés.'

    def handle(self, *args, **options):
        self.stdout.write("Début du processus de catégorisation...")
        
        # Filtre les transactions qui n'ont ni catégorie principale, ni sous-catégorie.
        uncategorized_transactions = Transaction.objects.filter(category__isnull=True)
        total_to_process = uncategorized_transactions.count()
        updated_count = 0

        # Prépare les modèles pour un accès rapide
        category_models = {cat.name: cat for cat in Category.objects.all()}
        subcategory_models = {sub.name: sub for sub in Subcategory.objects.all()}
        
        if not category_models or not subcategory_models:
            self.stdout.write(self.style.ERROR("Erreur: Catégories ou sous-catégories manquantes. Assurez-vous de les avoir créées dans l'interface d'administration Django."))
            return

        for transaction in uncategorized_transactions:
            description_lower = transaction.description.lower()
            found_subcategory_name = None

            for subcategory_name, keywords in SUBCATEGORY_KEYWORDS.items():
                if any(keyword.lower() in description_lower for keyword in keywords):
                    found_subcategory_name = subcategory_name
                    self.stdout.write(self.style.NOTICE(f"  -> Correspondance trouvée pour '{transaction.description}' avec la sous-catégorie '{subcategory_name}'."))
                    break
        
            if found_subcategory_name:
                found_category_name = SUBCATEGORY_TO_CATEGORY.get(found_subcategory_name)
                
                found_category = category_models.get(found_category_name)
                found_subcategory = subcategory_models.get(found_subcategory_name)

                if found_category and found_subcategory:
                    transaction.category = found_category
                    transaction.subcategory = found_subcategory
                    transaction.save()
                    updated_count += 1
                    self.stdout.write(self.style.SUCCESS(f"  -> Transaction ID {transaction.id} mise à jour avec la catégorie '{found_category_name}' et la sous-catégorie '{found_subcategory_name}'."))
                else:
                    self.stdout.write(self.style.WARNING(f"Avertissement: La sous-catégorie '{found_subcategory_name}' ou sa catégorie parent '{found_category_name}' n'a pas été trouvée dans la base de données. Transaction ID: {transaction.id}"))

        self.stdout.write(self.style.SUCCESS("\nProcessus terminé."))
        self.stdout.write(f"{total_to_process} transactions à traiter.")
        self.stdout.write(f"{updated_count} transactions ont été catégorisées et mises à jour.")