#!/usr/bin/env bash

# Exit on first error
set -e

# Build de l'application front-end
npm install --prefix frontend
npm run build --prefix frontend

# Collecte les fichiers statiques
python manage.py collectstatic --noinput

# Run database migrations
python manage.py makemigrations
python manage.py migrate --noinput

# Créez un super-utilisateur
python manage.py createsuperuser --noinput

# Démarrez le serveur Gunicorn
gunicorn dlmm_project.wsgi:application