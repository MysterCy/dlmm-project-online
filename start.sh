#!/usr/bin/env bash

# Exit on first error
set -e

# Démarrez le serveur Gunicorn
gunicorn dlmm_project.wsgi:application