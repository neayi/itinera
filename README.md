# Itinera - Gestion des itinéraires techniques agricoles

Application Next.js pour la gestion et la visualisation des rotations et itinéraires techniques agricoles.

## 🚀 Quick Start

### Développement avec Docker (Recommandé)

```bash
# Démarrer l'environnement de développement
docker-compose up -d

# Voir les logs
docker-compose logs -f nextjs
```

L'application sera accessible sur :
- **Next.js** : http://localhost:3000
- **phpMyAdmin** : http://localhost:8080
- **MySQL** : localhost:3306

### Développement local

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env

# Démarrer le serveur de développement
npm run dev
```

## 📦 Architecture

### Technologies

- **Frontend** : Next.js 15.5.9 (App Router)
- **Database** : MySQL 8.0 avec utf8mb4
- **UI** : React, Tailwind CSS, Radix UI
- **Visualisation** : @osfarm/itineraire-technique
- **Containerisation** : Docker, Docker Compose

### Structure de la base de données

- `users` - Utilisateurs/agriculteurs
- `farms` - Exploitations agricoles
- `systems` - Systèmes de culture avec données JSON de rotation

## 🛠️ Développement

### Mode développement (docker-compose.yml)

- **Hot reload** activé
- Volumes montés pour modification en direct
- `NODE_ENV=development`
- Serveur Next.js en mode dev

### Mode production (docker-compose.prod.yml)

- Build optimisé multi-stage
- Image légère Alpine Linux
- `NODE_ENV=production`
- Output standalone

Pour plus de détails, voir [DOCKER.md](./DOCKER.md)

## 🚢 Déploiement

### Build de production local

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD avec GitHub Actions

L'image Docker est automatiquement construite et publiée lors de la création d'une release.

```bash
# Créer une release
git tag v1.0.0
git push origin v1.0.0
gh release create v1.0.0
```

L'image sera disponible sur :
```
ghcr.io/neayi/itinera:v1.0.0
ghcr.io/neayi/itinera:latest
```

Pour plus de détails, voir [.github/WORKFLOWS.md](./.github/WORKFLOWS.md)

## 📚 Documentation

- [DOCKER.md](./DOCKER.md) - Guide complet Docker et Docker Compose
- [.github/WORKFLOWS.md](./.github/WORKFLOWS.md) - Documentation GitHub Actions

## 🔧 Scripts disponibles

```bash
npm run dev       # Serveur de développement
npm run build     # Build de production
npm run start     # Démarrage en mode production
npm run lint      # Linter ESLint
```

## 🗃️ Variables d'environnement

Créer un fichier `.env` :

```env
# Database
DB_HOST=mysql
DB_PORT=3306
DB_USER=itinera_user
DB_PASSWORD=itinera_password
DB_NAME=itinera_db
MYSQL_ROOT_PASSWORD=root_password

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 📝 API Endpoints

- `GET /api/health` - Health check
- `GET /api/systems` - Liste des systèmes de culture
- `POST /api/systems` - Créer un système
- `GET /api/farms` - Liste des exploitations
- `POST /api/farms` - Créer une exploitation
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence privée.

## 🔗 Liens

- Projet Figma original : https://www.figma.com/design/7yz6udmTqfpPTDgrmCOyz1/Itinera_1212_PM_3
- Repository : https://github.com/neayi/itinera
