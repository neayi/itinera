# Guide de Démarrage Rapide - Itinera Next.js

## 🚀 Démarrage en 3 étapes

### Option 1 : Script automatique (Recommandé)
```bash
./start.sh
```

### Option 2 : Commandes manuelles
```bash
# 1. Copier la configuration
cp .env.example .env

# 2. Construire et lancer
docker-compose up --build -d

# 3. Vérifier le statut
docker-compose ps
```

### Option 3 : Avec Makefile
```bash
make install  # Si première fois
make prod     # Build et lance en production
```

## 📍 URLs d'accès

- **Application**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health
- **API Itineraries**: http://localhost:3000/api/itineraries
- **MySQL**: localhost:3306

## 🔑 Credentials par défaut

**MySQL:**
- Host: `mysql` (ou `localhost` depuis l'extérieur)
- Port: `3306`
- Database: `itinera_db`
- User: `itinera_user`
- Password: `itinera_password`
- Root Password: `root_password`

## 🛠️ Commandes utiles

### Docker Compose
```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f nextjs
docker-compose logs -f mysql

# Redémarrer un service
docker-compose restart nextjs

# Reconstruire et redémarrer
docker-compose up --build -d

# Supprimer tout (conteneurs + volumes)
docker-compose down -v

# Statut des services
docker-compose ps
```

### Makefile (shortcuts)
```bash
make help        # Affiche toutes les commandes disponibles
make build       # Construit les images
make up          # Démarre les conteneurs
make down        # Arrête les conteneurs
make restart     # Redémarre
make logs        # Affiche les logs
make logs-next   # Logs Next.js uniquement
make logs-mysql  # Logs MySQL uniquement
make clean       # Nettoie tout
make dev         # Lance en mode développement local
make prod        # Build et lance en production
make shell-next  # Ouvre un shell dans Next.js
make shell-mysql # Ouvre MySQL CLI
make health      # Vérifie la santé des services
```

### Accès aux conteneurs
```bash
# Shell dans le conteneur Next.js
docker exec -it itinera-nextjs sh

# MySQL CLI
docker exec -it itinera-mysql mysql -u itinera_user -p

# MySQL CLI en root
docker exec -it itinera-mysql mysql -u root -p
```

### Développement local (sans Docker)
```bash
# Installer les dépendances
npm install

# Créer .env.local
cp .env.example .env.local
# Modifier DB_HOST=localhost dans .env.local

# Lancer en mode dev
npm run dev

# Build de production
npm run build

# Lancer le serveur de production
npm start
```

## 🔍 Vérification de santé

### Tester l'API
```bash
# Health check
curl http://localhost:3000/api/health

# Avec formatage JSON
curl http://localhost:3000/api/health | jq

# Lister les itinéraires
curl http://localhost:3000/api/itineraries
```

### Vérifier MySQL
```bash
# Depuis le host
docker exec itinera-mysql mysqladmin ping -h localhost -u root -proot_password

# Se connecter à MySQL
docker exec -it itinera-mysql mysql -u itinera_user -pitinera_password itinera_db

# Lister les tables
docker exec -it itinera-mysql mysql -u itinera_user -pitinera_password -e "USE itinera_db; SHOW TABLES;"
```

## 🐛 Dépannage

### Les conteneurs ne démarrent pas
```bash
# Vérifier les logs
docker-compose logs

# Supprimer et recréer
docker-compose down -v
docker-compose up --build
```

### Erreur de connexion MySQL
```bash
# Vérifier que MySQL est prêt
docker-compose logs mysql

# Attendre que le healthcheck passe
docker-compose ps
```

### Port déjà utilisé
```bash
# Vérifier les ports utilisés
sudo lsof -i :3000
sudo lsof -i :3306

# Modifier les ports dans docker-compose.yml
# Par exemple: "3001:3000" au lieu de "3000:3000"
```

### Reset complet
```bash
# Supprimer tout
docker-compose down -v
docker system prune -a
rm -rf .next node_modules

# Recommencer
npm install
docker-compose up --build
```

## 📊 Monitoring

### Voir l'utilisation des ressources
```bash
docker stats

# Pour des services spécifiques
docker stats itinera-nextjs itinera-mysql
```

### Inspecter les conteneurs
```bash
docker inspect itinera-nextjs
docker inspect itinera-mysql
```

## 🔄 Mise à jour

### Mettre à jour les dépendances
```bash
# Arrêter les services
docker-compose down

# Mettre à jour package.json
npm update

# Reconstruire
docker-compose up --build
```

### Appliquer des migrations SQL
```bash
# Copier le fichier SQL dans le conteneur
docker cp migration.sql itinera-mysql:/tmp/

# Exécuter
docker exec -it itinera-mysql mysql -u itinera_user -pitinera_password itinera_db < /tmp/migration.sql
```

## 📝 Structure des données

### Exemple de requête SQL
```sql
-- Voir tous les itinéraires
SELECT * FROM itineraries;

-- Voir avec les jointures
SELECT
  i.*,
  p.name as parcelle_name,
  e.name as exploitation_name,
  u.name as farmer_name
FROM itineraries i
LEFT JOIN parcelles p ON i.parcelle_id = p.id
LEFT JOIN exploitations e ON p.exploitation_id = e.id
LEFT JOIN users u ON e.owner_id = u.id;
```

## 🎯 Prochaines étapes

1. Accéder à http://localhost:3000
2. Tester la liste des itinéraires
3. Créer un nouvel itinéraire avec le wizard
4. Consulter les détails d'un projet
5. Vérifier les données dans MySQL

## 📚 Documentation complète

- **README-NEXTJS.md**: Documentation détaillée du projet
- **MIGRATION.md**: Guide de migration Vite → Next.js
- **.env.example**: Variables d'environnement disponibles

## 🆘 Support

En cas de problème:
1. Vérifier les logs: `docker-compose logs`
2. Vérifier le health check: `make health` ou `curl localhost:3000/api/health`
3. Consulter MIGRATION.md pour les détails techniques
