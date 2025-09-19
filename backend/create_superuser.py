import os
from django.contrib.auth import get_user_model

User = get_user_model()

# Récupérer les informations de l'environnement ou utiliser des valeurs par défaut
# ATTENTION : Changez ces valeurs pour vos propres informations
# Une bonne pratique serait de les définir dans les variables d'environnement de Render.
# (Settings -> Environment -> Add Environment Variable)
USERNAME = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
EMAIL = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
PASSWORD = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin1234')

# Vérifier si un super-utilisateur existe déjà pour ne pas dupliquer
if not User.objects.filter(username=USERNAME).exists():
    print(f'Création du super-utilisateur {USERNAME}...')
    User.objects.create_superuser(USERNAME, EMAIL, PASSWORD)
    print(f'Super-utilisateur {USERNAME} créé avec succès !')
else:
    print(f'Le super-utilisateur {USERNAME} existe déjà. Aucune action requise.')