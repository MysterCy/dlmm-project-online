#!/usr/bin/env bash

# Exit on first error
set -e

# Run database migrations
echo "Running database migrations..."
python backend/manage.py migrate --no-input

# Create a superuser non-interactively
echo "Creating superuser..."
python backend/create_superuser.py

# Collect static files
echo "Collecting static files..."
python backend/manage.py collectstatic --no-input --clear

# Start the Gunicorn server
echo "Starting Gunicorn server..."
gunicorn dlmm_project.wsgi:application