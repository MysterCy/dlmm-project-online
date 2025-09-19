#!/usr/bin/env bash

# Sortez du script à la première erreur
set -e

# Exécutez les migrations de la base de données
echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate --noinput

# Créez un super-utilisateur s'il n'existe pas
echo "Creating superuser..."
python manage.py createsuperuser --noinput

# Démarrez le serveur Gunicorn
echo "Starting Gunicorn server..."
gunicorn dlmm_project.wsgi:application