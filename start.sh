#!/bin/bash

echo "Démarrage des serveurs..."

echo "Lancement du backend Django..."
# Active l'environnement virtuel et lance le serveur Django
(cd /Users/cyrilbarratier/Documents/DLMM/backend && source venv/bin/activate && python3 manage.py runserver) &

echo "Lancement du frontend React..."
(cd /Users/cyrilbarratier/Documents/DLMM/frontend && npm start) &

sleep 5

echo "Les deux serveurs sont démarrés."
echo "Pour les arrêter, retournez dans ce terminal et appuyez sur Ctrl+C."
wait