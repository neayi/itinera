# GitHub Actions Workflows

## Docker Build and Push

Le workflow `.github/workflows/docker-build.yml` construit et publie automatiquement l'image Docker sur GitHub Container Registry.

### Déclencheurs

1. **Release GitHub** : Se déclenche automatiquement lors de la création d'une release
2. **Manuel** : Peut être déclenché manuellement via l'onglet Actions

### Processus de build

1. Checkout du code
2. Configuration de Docker Buildx (pour multi-plateforme)
3. Connexion à GitHub Container Registry
4. Extraction des métadonnées (tags, labels)
5. Build de l'image Docker
6. Push vers ghcr.io

### Tags générés automatiquement

Pour une release `v1.2.3`, les tags suivants sont créés :
- `ghcr.io/neayi/itinera:v1.2.3` (version exacte)
- `ghcr.io/neayi/itinera:v1.2` (majeur.mineur)
- `ghcr.io/neayi/itinera:v1` (majeur)
- `ghcr.io/neayi/itinera:latest` (si branche par défaut)

### Plateformes supportées

- `linux/amd64` (x86_64)
- `linux/arm64` (ARM 64-bit)

### Cache

Le workflow utilise GitHub Actions Cache pour accélérer les builds successifs.

## Créer une release

### Via l'interface GitHub

1. Aller sur l'onglet "Releases"
2. Cliquer sur "Draft a new release"
3. Créer un nouveau tag (ex: `v1.0.0`)
4. Remplir le titre et la description
5. Publier la release

### Via la ligne de commande

```bash
# Créer et pousser un tag
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0

# Créer la release avec GitHub CLI
gh release create v1.0.0 --title "Version 1.0.0" --notes "Description des changements"
```

### Vérifier le build

1. Aller sur l'onglet "Actions"
2. Cliquer sur le workflow "Build and Push Docker Image"
3. Vérifier les logs du build

### Utiliser l'image publiée

```bash
# Pull l'image
docker pull ghcr.io/neayi/itinera:latest

# Ou utiliser directement dans docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Permissions requises

Le workflow nécessite les permissions suivantes (déjà configurées) :
- `contents: read` - Lire le code du repository
- `packages: write` - Écrire dans GitHub Container Registry

## Variables de secrets

Le workflow utilise automatiquement :
- `GITHUB_TOKEN` - Fourni automatiquement par GitHub Actions
- Aucun secret personnalisé n'est requis

## Troubleshooting

### L'image n'est pas publique

Pour rendre l'image publique :
1. Aller sur https://github.com/orgs/neayi/packages
2. Cliquer sur le package `itinera`
3. Package settings → Change visibility → Public

### Build échoue

Vérifier :
- Le Dockerfile est valide
- Les dépendances sont disponibles
- Les tests passent (si configurés)
- Les permissions sont correctes
