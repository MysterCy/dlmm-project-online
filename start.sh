#!/usr/bin/env bash

# Exit on first error
set -e

# Build de l'application front-end
npm install --prefix frontend
npm run build --prefix frontend

# Copie des fichiers statiques
cp -r frontend/build/* staticfiles/
cp -r frontend/public/* staticfiles/

# Run database migrations
python manage.py makemigrations
python manage.py migrate --noinput

# Créez un super-utilisateur
python manage.py createsuperuser --noinput

# Démarrez le serveur Gunicorn
gunicorn dlmm_project.wsgi:application