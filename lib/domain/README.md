# Architecture Domain-Driven

Cette application utilise une architecture en couches avec séparation des responsabilités selon les principes du Domain-Driven Design (DDD).

## Structure des dossiers

```
lib/domain/
├── system/
│   ├── system.entity.ts           # Entité métier pure (règles de validation)
│   ├── system.repository.ts       # Interface du repository (contrat)
│   ├── system.repository.mysql.ts # Implémentation MySQL du repository
│   ├── system.service.ts          # Service (orchestration métier)
│   └── index.ts                   # Exports
├── wiki-pages/
│   ├── wiki-pages.entity.ts
│   ├── wiki-pages.repository.ts
│   ├── wiki-pages.repository.mysql.ts
│   ├── wiki-pages.service.ts
│   └── index.ts
├── itinera-params/
│   ├── itinera-params.entity.ts
│   ├── itinera-params.repository.ts
│   ├── itinera-params.repository.mysql.ts
│   ├── itinera-params.service.ts
│   └── index.ts
└── index.ts                        # Point d'entrée centralisé

shared/
├── system/
│   └── system.dto.ts               # DTOs partagés back/front
├── wiki-pages/
│   └── wiki-pages.dto.ts
└── itinera-params/
    └── itinera-params.dto.ts
```

## Couches de l'architecture

### 1. Entity (`.entity.ts`)
**Responsabilité** : Règles métier pures, validation des données

**Caractéristiques** :
- Pas de dépendance vers la base de données
- Logique métier pure (validation, transformations)
- Immuabilité des propriétés quand c'est pertinent

**Exemple** :
```typescript
export class SystemEntity {
  rename(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Le nom du système ne peut pas être vide');
    }
    this.name = newName;
  }
  
  static isValidGPS(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
}
```

### 2. Repository (`.repository.ts`)
**Responsabilité** : Interface/contrat pour l'accès aux données

**Caractéristiques** :
- Définit les méthodes CRUD
- Indépendant de l'implémentation (MySQL, PostgreSQL, etc.)
- Permet la testabilité avec des mocks

**Exemple** :
```typescript
export interface SystemRepository {
  findById(id: string): Promise<SystemDTO | null>;
  update(systemId: string, data: UpdateSystemDTO): Promise<void>;
  delete(systemId: string): Promise<void>;
}
```

### 3. Repository MySQL (`.repository.mysql.ts`)
**Responsabilité** : Implémentation concrète pour MySQL

**Caractéristiques** :
- Implémente l'interface Repository
- Contient les requêtes SQL
- Conversion entre la BDD et les DTOs
- Gère les transactions si nécessaire

**Exemple** :
```typescript
export class MySQLSystemRepository implements SystemRepository {
  async findById(id: string): Promise<SystemDTO | null> {
    return await queryOne<SystemDTO>(`
      SELECT * FROM systems WHERE id = ?
    `, [id]);
  }
}
```

### 4. Service (`.service.ts`)
**Responsabilité** : Orchestration métier, coordination entre entités et repository

**Caractéristiques** :
- Injection de dépendances (Repository en paramètre du constructeur)
- Validation avec les Entities
- Gestion des permissions et autorisations
- Orchestration de plusieurs opérations

**Exemple** :
```typescript
export class SystemService {
  constructor(private readonly repository: SystemRepository) {}

  async renameSystem(systemId: string, userId: number, name: string): Promise<void> {
    // Vérification des permissions
    await this.checkOwnership(systemId, userId);
    
    // Validation via l'entity
    const entity = new SystemEntity(...);
    entity.rename(name);

    // Persistance via le repository
    await this.repository.update(systemId, { name });
  }
}
```

### 5. DTO (`.dto.ts` dans `shared/`)
**Responsabilité** : Structures de données partagées entre backend et frontend

**Caractéristiques** :
- Interfaces TypeScript
- Pas de logique métier
- Partageable entre serveur et client
- Documentation des contrats d'API

**Exemple** :
```typescript
export interface SystemDTO {
  id: string;
  name: string;
  user_id: number;
  // ...
}

export interface UpdateSystemDTO {
  name?: string;
  description?: string;
  // ...
}
```

## Utilisation dans les API Routes

```typescript
import { SystemService, MySQLSystemRepository } from '@/lib/domain/system';

// Instancier le service avec le repository
const systemService = new SystemService(new MySQLSystemRepository());

export async function PATCH(request: NextRequest, { params }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  const body = await request.json();

  // Utiliser le service
  await systemService.updateSystem(id, user.userId, body);

  return NextResponse.json({ success: true });
}
```

## Avantages de cette architecture

### ✅ Séparation des responsabilités
- Chaque couche a un rôle clairement défini
- Facilite la maintenance et les évolutions

### ✅ Testabilité
- Les services peuvent être testés avec des repositories mockés
- Les entities sont testables indépendamment

### ✅ Flexibilité
- Changement de BDD facilité (nouvelle implémentation du repository)
- Ajout de nouvelles sources de données (API externe, cache, etc.)

### ✅ Réutilisabilité
- Les services peuvent être utilisés dans plusieurs routes
- Les DTOs sont partagés entre back et front

### ✅ Type-safety
- TypeScript avec interfaces strictes
- Contrats d'API documentés via les DTOs

## Pattern d'injection de dépendances

```typescript
// Dans les routes API
const service = new SystemService(new MySQLSystemRepository());

// Dans les tests
const mockRepository: SystemRepository = {
  findById: jest.fn(),
  update: jest.fn(),
  // ...
};
const service = new SystemService(mockRepository);
```

## Migration progressive

Les anciens fichiers peuvent coexister temporairement :
- `lib/domain/System.ts` (ancien) ← peut être supprimé
- `lib/domain/system/` (nouveau) ← à utiliser

Pour migrer progressivement :
1. Créer les nouveaux fichiers dans `domain/<entité>/`
2. Migrer les routes API une par une
3. Supprimer les anciens fichiers quand tout est migré

## Conventions de nommage

- **Entity** : `<Entity>Entity` (ex: `SystemEntity`)
- **Repository Interface** : `<Entity>Repository` (ex: `SystemRepository`)
- **Repository MySQL** : `MySQL<Entity>Repository` (ex: `MySQLSystemRepository`)
- **Service** : `<Entity>Service` (ex: `SystemService`)
- **DTO** : `<Entity>DTO`, `Update<Entity>DTO`, `Create<Entity>DTO`
