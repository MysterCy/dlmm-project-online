#!/usr/bin/env bash

# Sortez du script à la première erreur
set -e

# Build de l'application front-end
npm install --prefix frontend
npm run build --prefix frontend

# Run database migrations
python manage.py makemigrations
python manage.py migrate --noinput

# Créez un super-utilisateur
python manage.py createsuperuser --noinput

# Démarrez le serveur Gunicorn
gunicorn dlmm_project.wsgi:application