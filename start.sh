#!/usr/bin/env bash

# Exit on first error
set -e

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --no-input

# Create a superuser non-interactively
echo "Creating superuser..."
python -c "import os; from django.contrib.auth import get_user_model; User = get_user_model(); if not User.objects.filter(username=os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')).exists(): User.objects.create_superuser(os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin'), os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com'), os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin1234'))"

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input --clear

# Start the Gunicorn server
echo "Starting Gunicorn server..."
gunicorn dlmm_project.wsgi:application