#!/usr/bin/env bash

# Exit on first error
set -e

# Run database migrations
echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate --noinput

# Collectez les fichiers statiques (CSS, JS, images, etc.)
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Démarrez le serveur Gunicorn
echo "Starting Gunicorn server..."
gunicorn dlmm_project.wsgi:application