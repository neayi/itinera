# Docker Setup Guide

## Development Environment

Le fichier `docker-compose.yml` est configuré pour le développement avec hot-reload.

### Démarrer l'environnement de développement

```bash
docker-compose up -d
```

### Caractéristiques du mode développement

- **Hot Reload** : Les modifications de code sont automatiquement détectées et rechargées
- **Volumes montés** : Le code source est monté depuis l'hôte
- **node_modules isolé** : Les dépendances restent dans le container
- **Next.js Dev Server** : Utilise `npm run dev` avec watch mode
- **NODE_ENV=development**

### Fichiers surveillés

Les dossiers suivants sont montés et surveillés :
- `src/`
- `app/`
- `components/`
- `lib/`
- `public/`
- `styles/`

### Reconstruire le container de développement

Si vous modifiez `package.json` ou ajoutez de nouvelles dépendances :

```bash
docker-compose down
docker-compose build --no-cache nextjs
docker-compose up -d
```

## Production Environment

Le fichier `docker-compose.prod.yml` utilise une image Docker optimisée pour la production.

### Démarrer l'environnement de production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Construire l'image de production localement

```bash
docker-compose -f docker-compose.prod.yml build
```

### Caractéristiques du mode production

- **Build optimisé** : Multi-stage build avec standalone output
- **Image légère** : Basée sur Alpine Linux
- **Sécurisé** : Utilise un utilisateur non-root
- **NODE_ENV=production**

## CI/CD - GitHub Actions

L'image Docker est automatiquement construite et publiée sur GitHub Container Registry lors de la création d'une release.

### Workflow automatique

Le fichier `.github/workflows/docker-build.yml` se déclenche :
- Lors de la création d'une release GitHub
- Manuellement via workflow_dispatch

### Tags d'images générées

- `latest` : Dernière version de la branche principale
- `v1.2.3` : Version exacte (si release semver)
- `v1.2` : Version majeure.mineure
- `v1` : Version majeure

### Créer une release

1. Créer un tag :
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. Créer une release sur GitHub avec ce tag

3. L'image sera automatiquement construite et publiée sur :
   ```
   ghcr.io/neayi/itinera:v1.0.0
   ghcr.io/neayi/itinera:latest
   ```

### Utiliser l'image publiée

```bash
docker pull ghcr.io/neayi/itinera:latest
docker run -p 3000:3000 ghcr.io/neayi/itinera:latest
```

## Services

### Next.js (Port 3000)
- **Dev** : http://localhost:3000
- **Prod** : http://localhost:3000

### MySQL (Port 3306)
- Host : `localhost:3306`
- User : `itinera_user`
- Password : `itinera_password`
- Database : `itinera_db`

### phpMyAdmin (Port 8080)
- URL : http://localhost:8080
- User : `itinera_user`
- Password : `itinera_password`

## Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
DB_USER=itinera_user
DB_PASSWORD=itinera_password
DB_NAME=itinera_db
MYSQL_ROOT_PASSWORD=root_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Commandes utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f nextjs
```

### Redémarrer un service

```bash
docker-compose restart nextjs
```

### Arrêter tous les services

```bash
docker-compose down
```

### Arrêter et supprimer les volumes (⚠️ Supprime les données)

```bash
docker-compose down -v
```

### Exécuter des commandes dans le container

```bash
# Dev
docker-compose exec nextjs npm install <package>
docker-compose exec nextjs npm run lint

# Prod
docker-compose -f docker-compose.prod.yml exec nextjs sh
```
