# dlmm_app/management/commands/delete_old_transactions.py

from django.core.management.base import BaseCommand
from dlmm_app.models import Transaction
from datetime import date

class Command(BaseCommand):
    help = 'Deletes all transactions created before a specific date.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Démarrage de la suppression des transactions..."))

        # Définir la date limite. Toutes les transactions antérieures à cette date seront supprimées.
        limit_date = date(2024, 1, 1)

        # Filtrer et compter les transactions à supprimer
        transactions_to_delete = Transaction.objects.filter(date__lt=limit_date)
        count = transactions_to_delete.count()

        if count > 0:
            self.stdout.write(self.style.WARNING(f"Confirmation : Vous êtes sur le point de supprimer {count} transactions antérieures au 01/01/2024."))
            confirm = input("Voulez-vous continuer ? (oui/non) : ")
            
            if confirm.lower() == 'oui':
                transactions_to_delete.delete()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"\nTerminé. {count} transaction(s) ont été supprimée(s)."
                    )
                )
            else:
                self.stdout.write(self.style.NOTICE("Opération annulée par l'utilisateur."))
        else:
            self.stdout.write(self.style.SUCCESS("Aucune transaction à supprimer trouvée avant le 01/01/2024."))