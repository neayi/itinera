# Migration Vite.js → Next.js - Résumé

## Changements effectués

### 1. Structure des dossiers
```
AVANT (Vite)              APRÈS (Next.js)
├── src/                  ├── app/
│   ├── main.tsx          │   ├── layout.tsx
│   ├── App.tsx           │   ├── page.tsx
│   ├── pages/            │   ├── project/[id]/page.tsx
│   ├── components/       │   ├── wizard/page.tsx
│   ├── data/             │   └── api/
│   ├── types.ts          ├── components/
│   └── index.css         │   ├── pages/
├── public/               │   └── ui/
├── index.html            ├── lib/
└── vite.config.ts        │   ├── data/
                          │   ├── types.ts
                          │   └── db.ts
                          ├── public/
                          ├── next.config.js
                          ├── docker-compose.yml
                          └── Dockerfile
```

### 2. Routing

**Vite (React Router simulation):**
- Gestion manuelle de l'état de navigation
- useState pour changer de vue

**Next.js (App Router):**
- Routes basées sur le système de fichiers
- `/` → `app/page.tsx` (Liste)
- `/project/[id]` → `app/project/[id]/page.tsx` (Détails)
- `/wizard` → `app/wizard/page.tsx` (Assistant)

### 3. Imports

**Avant:**
```tsx
import { Component } from '../components/Component'
import { type } from '../types'
```

**Après:**
```tsx
import { Component } from '@/components/Component'
import { type } from '@/lib/types'
```

### 4. Assets statiques

**Avant:** `figma:asset/xxx.png`
**Après:** `/assets/xxx.png` dans `public/`

### 5. Configuration

**package.json:**
- Supprimé: `vite`, `@vitejs/plugin-react-swc`
- Ajouté: `next`, `mysql2`

**Scripts:**
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
```

### 6. Nouveautés

#### Docker
- **Dockerfile multi-stage** avec build optimisé
- **docker-compose.yml** avec services Next.js + MySQL
- **init-db/** avec scripts SQL d'initialisation

#### Base de données
- Configuration MySQL avec pool de connexions
- Routes API REST (`/api/health`, `/api/itineraries`)
- Helpers de requêtes dans `lib/db.ts`

#### Environnement
- `.env.example` avec variables Docker
- `.env.local` pour développement local

## Commandes principales

```bash
# Développement local
npm install
npm run dev

# Production avec Docker
docker-compose up --build

# ou avec Makefile
make install
make prod
```

## Points d'attention

### Client Components
Tous les composants utilisant des hooks React nécessitent `'use client'` en haut du fichier.

### Images
Les images sont maintenant servies depuis `public/` et référencées avec `/chemin/vers/image.png`.

### API Routes
Les routes API Next.js sont dans `app/api/*/route.ts` et exportent des fonctions `GET`, `POST`, etc.

### TypeScript
Configuration stricte avec chemins d'alias `@/` configurés dans `tsconfig.json`.

## Architecture Docker

### Services
1. **nextjs**: Application Next.js (port 3000)
2. **mysql**: Base de données (port 3306)

### Volumes
- `mysql-data`: Persistance des données MySQL
- `./public`: Assets statiques (read-only)

### Réseau
- `itinera-network`: Réseau bridge pour communication inter-services

## Prochaines étapes recommandées

1. ✅ **Configuration complétée**
2. ⏳ Implémenter les routes API pour CRUD complet
3. ⏳ Ajouter l'authentification (NextAuth.js)
4. ⏳ Optimiser les images avec next/image
5. ⏳ Ajouter des tests (Jest + React Testing Library)
6. ⏳ Configurer CI/CD
7. ⏳ Ajouter monitoring et logs

## Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Docker Compose](https://docs.docker.com/compose/)
- [MySQL Docker](https://hub.docker.com/_/mysql)
