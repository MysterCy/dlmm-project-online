#!/usr/bin/env bash
# Exit on first error
set -e

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create a superuser if it doesn't exist
python manage.py createsuperuser --noinput

# Start the Gunicorn server
gunicorn dlmm_project.wsgi:application