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
├── lib/                         # Utilitaires et couche métier
│   ├── domain/                  # Domain-Driven Design
│   │   ├── system/              # Domaine System
│   │   │   ├── system.entity.ts      # Entité métier
│   │   │   ├── system.repository.ts  # Interface repository
│   │   │   ├── system.repository.mysql.ts  # Implémentation MySQL
│   │   │   └── system.service.ts     # Service métier
│   │   ├── user/                # Domaine User
│   │   ├── farm/                # Domaine Farm
│   │   ├── wiki-pages/          # Domaine WikiPages
│   │   └── itinera-params/      # Domaine ItineraParams
│   ├── read/                    # Opérations de lecture avec jointures
│   │   └── systemWithFarm.read.ts  # Jointures System + Farm
│   ├── db.ts                    # Connexion base de données
│   └── ...
├── shared/                      # DTOs partagés (API contracts)
│   ├── system/
│   │   └── system.dto.ts        # DTO System (table systems uniquement)
│   ├── system-with-farm/
│   │   └── system-with-farm.dto.ts  # DTO avec jointure
│   ├── user/
│   │   └── user.dto.ts
│   ├── farm/
│   │   └── farm.dto.ts
│   └── ...
├── init-db/                     # Scripts SQL d'initialisation
└── public/                      # Assets statiques
```

### Architecture Domain-Driven Design (DDD)

**Principe :** Chaque domaine gère **une seule table SQL**.

**Structure d'un domaine** (`lib/domain/{entity}/`) :
1. **`{entity}.entity.ts`** : Entité métier avec validations
2. **`{entity}.repository.ts`** : Interface repository (contrat)
3. **`{entity}.repository.mysql.ts`** : Implémentation MySQL
4. **`{entity}.service.ts`** : Service métier (orchestration)

**Séparation des responsabilités :**
- **Entity** : Modèle du domaine avec règles métier
- **Repository** : Accès aux données, retourne des **Entities**
- **Service** : Orchestration métier, retourne des **DTOs**
- **DTO** : Contrat d'API (dans `shared/`)

**Opérations avec jointures :**
- Les repositories ne font **pas de jointures**
- Les jointures sont dans `lib/read/` pour les opérations en lecture seule
- Exemple : `getSystemWithFarm()` combine `systems` + `farms`

### DTOs (Data Transfer Objects)

**Principe :** Un seul DTO par entité, pas de `CreateDTO`/`UpdateDTO`.

**Pattern :**
```typescript
// Un seul DTO représentant la table
export interface SystemDTO {
  id: string;
  farm_id: number | null;
  user_id: number;
  name: string;
  // ... tous les champs de la table
  created_at: Date;
  updated_at: Date;
}

// Pour les créations : Omit des champs auto-générés
async createSystem(
  data: Omit<SystemDTO, 'id' | 'created_at' | 'updated_at' | 'eiq' | 'gross_margin' | 'duration'>
): Promise<string>

// Pour les mises à jour : Partial
async updateSystem(
  systemId: string,
  data: Partial<SystemDTO>
): Promise<void>
```

**DTOs avec jointures :**
- Dans `shared/{entity}-with-{other}/`
- Exemple : `SystemWithFarmDTO` contient `farm_name`, `farmer_name`
- Utilisés uniquement en lecture

## Base de données

**Type :** MySQL

**Tables principales :**
- `systems` : Systèmes de culture (JSON dans colonne `json`, localisation GPS)
- `farms` : Exploitations agricoles (nom, agriculteur)
- `users` : Utilisateurs
- `itinera_params` : Paramètres de l'application
- `wiki_pages` : Pages wiki

**Principe DDD :** Une table = un domaine dans `lib/domain/{table}/`

### Localisation géographique

Les données de localisation sont stockées **uniquement dans la table `systems`** :
- `gps_location` : POINT MySQL (latitude, longitude)
- `dept_no` : Numéro de département
- `town` : Nom de la commune

La table `farms` ne contient **pas** de données de localisation (seulement `name`, `farmer_name`).

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

### Architecture et patterns

**Domain-Driven Design :**
- Un domaine par table SQL dans `lib/domain/{entity}/`
- Fichiers : `entity.ts`, `repository.ts`, `repository.mysql.ts`, `service.ts`
- Les repositories retournent des **Entities** (pas de DTOs)
- Les services convertissent les Entities en **DTOs** avec `toDTO()`
- Les jointures SQL sont dans `lib/read/` (lecture seule)

**DTOs (Data Transfer Objects) :**
- Un seul DTO par entité dans `shared/{entity}/{entity}.dto.ts`
- ❌ **Ne pas créer** de `CreateDTO` ou `UpdateDTO`
- ✅ **Utiliser** `Omit<DTO, 'id' | 'created_at' | 'updated_at'>` pour les créations
- ✅ **Utiliser** `Partial<DTO>` pour les mises à jour
- Les DTOs avec jointures sont dans `shared/{entity}-with-{other}/`

**Gestion des champs NULL vs undefined :**
- Les DTOs utilisent `| null` pour les champs SQL nullable
- Les services convertissent `null` en `undefined` avant d'appeler les repositories

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
