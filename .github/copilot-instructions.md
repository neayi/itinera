# Instructions Copilot - Itinera

## Vue d'ensemble du projet

Itinera est une application web pour la gestion et la visualisation de systèmes de culture agricoles (rotations, interventions, itinéraires techniques).

**Stack technique :**
- Framework : Next.js 16.1.1 (App Router)
- Frontend : React 19 avec TypeScript
- Styling : SCSS (préféré pour les nouveaux composants)
- Base de données : MySQL
- Conteneurisation : Docker

## Environnement de développement

### Docker (méthode principale)

⚠️ **Important** : L'application doit être exécutée via Docker, **pas avec `npm run dev`**.

**Démarrer l'application :**
```bash
docker compose up
```

**Accès à l'application :**
- URL : http://localhost:3000/

**Rebuild après ajout de packages npm :**
```bash
# Après avoir ajouté un package avec npm install
docker compose build
docker compose up
```

**Accéder au shell du container :**
```bash
docker compose exec itinera sh
```

## Architecture du projet

### Structure des dossiers

```
itinera/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── farms/
│   │   ├── systems/             # CRUD systèmes de culture
│   │   └── ...
│   ├── project/[id]/            # Pages projet
│   └── wizard/                  # Assistant création
├── components/                   # Composants React
│   ├── interventions-table/     # Table des interventions
│   ├── pages/                   # Composants de page
│   ├── ui/                      # Composants UI shadcn/ui
│   └── ...
├── lib/                         # Utilitaires
│   ├── db.ts                    # Connexion base de données
│   ├── types.ts                 # Types TypeScript
│   └── ...
├── init-db/                     # Scripts SQL d'initialisation
└── public/                      # Assets statiques
```

## Base de données

**Type :** MySQL

**Tables principales :**
- `systems` : Systèmes de culture (JSON dans colonne `json`)
- `farms` : Exploitations agricoles
- `users` : Utilisateurs

### Structure JSON des systèmes

Les données des systèmes de culture sont stockées dans un champ JSON avec cette structure :

```json
{
  "steps": [
    {
      "id": "step1",
      "name": "Orge + Lupin",
      "startDate": "2026-03-01T00:00:00.000Z",
      "endDate": "2026-07-20T00:00:00.000Z",
      "interventions": [
        {
          "id": "uuid",
          "day": "0",
          "name": "Labour",
          "description": "Description...",
          "type": "intervention_top",
          "values": [
            {"key": "frequence", "value": 1},
            {"key": "azoteOrganique", "value": 25.5},
            {"key": "ges", "value": 0.062}
          ]
        }
      ]
    }
  ]
}
```

**Important :** Les valeurs numériques des interventions sont stockées dans un tableau `values[]` de paires clé/valeur.

## Conventions de code

### Style

- **CSS :** Utiliser SCSS pour les nouveaux composants
- **Naming :** PascalCase pour les composants, camelCase pour les variables
- **Types :** TypeScript strict, typer toutes les props et états

### Patterns courants

**Composants éditables :**
- Clic sur une cellule pour éditer
- Boutons ✓ (sauvegarder) et ✕ (annuler)
- Sauvegarde automatique en base via API PATCH
- Callback `onUpdate` pour rafraîchir les données

**Formatage des valeurs numériques :**
- Utiliser la fonction `formatValue()` de `components/interventions-table/formatters.ts`
- Supporte les unités (€, kg, h, kg CO2e, qtx)
- Arrondi selon le type de donnée

## Librairies principales

- **TanStack Table v8** : Tables de données avec tri, groupes, colonnes
- **shadcn/ui** : Composants UI dans `components/ui/`
- **Lucide React** : Icônes
- **sass** : Compilation SCSS

## API Routes

**Pattern :**
```
/api/[resource]/[id]/route.ts
```

**Méthodes supportées :**
- GET : Récupérer des données
- POST : Créer
- PATCH : Mettre à jour (utilisé pour les éditions inline)
- DELETE : Supprimer

**Exemple de mise à jour système :**
```typescript
await fetch(`/api/systems/${systemId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ json: updatedSystemData })
});
```
