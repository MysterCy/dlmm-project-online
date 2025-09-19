#!/usr/bin/env bash

# Exit on first error
set -e

# Run database migrations
python manage.py makemigrations
python manage.py migrate --noinput

# Collectez les fichiers statiques (CSS, JS, images, etc.)
python manage.py collectstatic --no-input

# Démarrez le serveur Gunicorn
gunicorn dlmm_project.wsgi:application