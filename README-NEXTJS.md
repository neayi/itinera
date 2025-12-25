# Itinera - Next.js Migration

## Description

Application de gestion des itinéraires techniques et rotations agricoles, convertie de Vite.js vers Next.js avec Docker.

## Stack Technique

- **Frontend**: Next.js 15 (App Router)
- **Base de données**: MySQL 8.0
- **Conteneurisation**: Docker & Docker Compose
- **UI Components**: Radix UI, Tailwind CSS
- **Visualisation**: Composant `@osfarm/itineraire-technique`

## Structure du Projet

```
itinera/
├── app/                      # Pages Next.js (App Router)
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Page d'accueil (liste des itinéraires)
│   ├── project/[id]/        # Pages de détails des projets
│   └── wizard/              # Assistant de création
├── components/              # Composants React
│   ├── pages/              # Composants de pages
│   ├── ui/                 # Composants UI réutilisables
│   └── imports/            # Imports Figma
├── lib/                    # Utilitaires et données
│   ├── data/              # Données JSON
│   ├── guidelines/        # Documentation
│   └── types.ts           # Types TypeScript
├── public/                # Assets statiques
│   ├── js/               # Scripts du composant itineraire-technique
│   ├── css/              # Styles du composant
│   ├── data/             # Données JSON publiques
│   └── *.png             # Images
├── init-db/              # Scripts d'initialisation MySQL
├── docker-compose.yml    # Configuration Docker
├── Dockerfile            # Image Next.js
└── next.config.js        # Configuration Next.js
```

## Installation et Démarrage

### Prérequis

- Docker et Docker Compose
- Node.js 20+ (pour développement local sans Docker)

### Démarrage avec Docker (Production)

1. **Copier le fichier d'environnement**
   ```bash
   cp .env.example .env
   ```

2. **Modifier les variables d'environnement** (optionnel)
   Éditez `.env` pour personnaliser les credentials de la base de données.

3. **Construire et lancer les conteneurs**
   ```bash
   docker-compose up --build
   ```

4. **Accéder à l'application**
   - Application: http://localhost:3000
   - MySQL: localhost:3306

### Développement Local (sans Docker)

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Copier le fichier d'environnement**
   ```bash
   cp .env.example .env.local
   ```

3. **Configurer la base de données locale**
   Modifier `DB_HOST` dans `.env.local` pour pointer vers votre MySQL local.

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Accéder à l'application**
   http://localhost:3000

## Commandes Docker Utiles

```bash
# Démarrer les conteneurs
docker-compose up -d

# Arrêter les conteneurs
docker-compose down

# Voir les logs
docker-compose logs -f

# Reconstruire les images
docker-compose up --build

# Arrêter et supprimer les volumes
docker-compose down -v

# Accéder au conteneur Next.js
docker exec -it itinera-nextjs sh

# Accéder à MySQL
docker exec -it itinera-mysql mysql -u itinera_user -p
```

## Scripts NPM

```bash
npm run dev      # Démarrage en mode développement
npm run build    # Build de production
npm start        # Démarrage du serveur de production
npm run lint     # Linting du code
```

## Migrations depuis Vite

Les principales modifications apportées :

1. **Routage**: Vite/React Router → Next.js App Router
2. **Structure**: `src/` → `app/`, `components/`, `lib/`
3. **Assets**: Images Figma → `/public/`
4. **Configuration**: `vite.config.ts` → `next.config.js`
5. **Imports**: Chemins absolus avec alias `@/`

## Base de Données

Le schéma de la base de données est automatiquement créé au démarrage du conteneur MySQL via le script `init-db/01-init.sql`.

### Tables principales :
- `users` - Utilisateurs
- `exploitations` - Exploitations agricoles
- `parcelles` - Parcelles
- `itineraries` - Itinéraires techniques / Rotations
- `interventions` - Interventions agricoles
- `rotation_steps` - Étapes de rotation

## Configuration Docker

### Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `DB_HOST` | Hôte MySQL | `mysql` |
| `DB_PORT` | Port MySQL | `3306` |
| `DB_USER` | Utilisateur MySQL | `itinera_user` |
| `DB_PASSWORD` | Mot de passe MySQL | `itinera_password` |
| `DB_NAME` | Nom de la base | `itinera_db` |
| `MYSQL_ROOT_PASSWORD` | Mot de passe root MySQL | `root_password` |
| `NEXT_PUBLIC_APP_URL` | URL de l'application | `http://localhost:3000` |

### Volumes Docker

- `mysql-data`: Données persistantes de MySQL
- `./public`: Assets statiques (mounted en lecture seule)
- `./init-db`: Scripts d'initialisation SQL

## Composant Itinéraire Technique

Le projet utilise le composant `@osfarm/itineraire-technique` pour la visualisation des rotations.

Documentation: https://www.osfarm.org/itineraire-technique/

## Déploiement

### Build de production

```bash
# Local
npm run build
npm start

# Docker
docker-compose up --build
```

L'image Docker utilise un build multi-stage optimisé avec le mode `standalone` de Next.js pour une taille minimale.

## Dépannage

### Erreur de connexion à MySQL

Vérifiez que le conteneur MySQL est bien démarré et accessible :
```bash
docker-compose ps
docker-compose logs mysql
```

### Erreur de build Next.js

Supprimez les caches et rebuild :
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Port déjà utilisé

Modifiez les ports dans `docker-compose.yml` si 3000 ou 3306 sont déjà utilisés.

## Licence

Propriétaire - TIKA / Itinera

## Support

Pour toute question ou problème, consultez la documentation ou contactez l'équipe de développement.
