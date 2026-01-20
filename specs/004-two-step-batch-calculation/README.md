# Calcul en lot des indicateurs - Flux en deux étapes

## Vue d'ensemble

Cette fonctionnalité implémente un flux en deux étapes pour le calcul en lot des indicateurs manquants :
1. **Préparation** : Détection des indicateurs manquants et affichage d'une estimation
2. **Exécution** : Calcul effectif avec barre de progression

## Workflow utilisateur

### 1. Phase de préparation
Quand l'utilisateur clique sur "Calculer tout" :
- L'aside s'ouvre avec l'UI de préparation
- Une ligne est créée dans `ai_process_log` avec `status='started'`
- Affichage :
  - Nombre total d'indicateurs à calculer
  - Temps estimé (basé sur l'historique ou 4s/indicateur par défaut)
  - Bouton "Démarrer le calcul"
  - Bouton "Annuler"

### 2. Phase d'exécution
Quand l'utilisateur clique sur "Démarrer le calcul" :
- Démarrage du calcul via SSE avec le `processLogId` existant
- Affichage de la barre de progression en temps réel
- Mise à jour de la colonne `processed_indicators` à chaque indicateur calculé
- Mise à jour finale avec `status='completed'` ou `status='aborted'`

## Architecture technique

### Backend

#### API `/api/ai/prepare-calculation`
**Méthode** : POST
**Payload** :
```json
{
  "systemId": "system-uuid"
}
```

**Processus** :
1. Détecte les indicateurs manquants via `AI_CALCULABLE_INDICATORS`
2. Calcule le temps estimé :
   - Requête SQL : dernières 5 exécutions complètes (`indicator='all'` et `status='completed'`)
   - Calcul : `avgSecondsPerIndicator = SUM(duration) / SUM(processed_indicators)`
   - Par défaut : 4.0 secondes/indicateur si pas d'historique
3. Crée une ligne dans `ai_process_log` :
   - `status='started'`
   - `total_indicators=X`
   - `processed_indicators=0`
4. Retourne :
```json
{
  "processLogId": 123,
  "totalIndicators": 42,
  "estimatedSeconds": 168.5,
  "avgSecondsPerIndicator": 4.01
}
```

#### API `/api/ai/calculate-all-missing-stream` (modifiée)
**Méthode** : POST
**Payload** :
```json
{
  "systemId": "system-uuid",
  "processLogId": 123
}
```

**Changements** :
- Requiert maintenant `processLogId` (validation stricte)
- Ne crée plus de nouvelle ligne de log
- Met à jour la ligne existante avec `total_indicators` si différent
- Passe `processLogId` à `calculateAllMissing()`

#### `lib/ai/indicator-calculator.ts`
**Fonction** : `calculateAllMissing()`

**Changements** :
- Accepte `processLogId?: number` en option
- Si `processLogId` fourni :
  - Utilise ce log
  - Met à jour `total_indicators` si nécessaire
- Sinon :
  - Crée un nouveau log (comportement legacy)

**Algorithme** :
1. Détecte les indicateurs manquants
2. Si `processLogId` existe → UPDATE, sinon → INSERT
3. Appelle `await onProcessStarted(processLogId)` (timing SSE)
4. Itération séquentielle sur chaque indicateur :
   - Calcul
   - Sauvegarde en base (clone JSON modifié)
   - Mise à jour `processed_indicators++`
   - Check `isProcessAborted()` pour interruption
5. Calcule les totaux du système
6. Finalise le log avec `status='completed'`

### Frontend

#### `components/pages/ProjectDetails.tsx`

**Nouveaux états** :
```typescript
const [isBatchPrepared, setIsBatchPrepared] = useState<boolean>(false);
const [batchEstimation, setBatchEstimation] = useState<{
  totalIndicators: number;
  estimatedSeconds: number;
} | null>(null);
```

**Handlers modifiés** :

##### `handleCalculateAllMissing()` (ex "calculate all")
```typescript
// 1. Appelle /api/ai/prepare-calculation
// 2. Stocke processLogId dans batchProcessLogIdRef.current
// 3. Set isBatchPrepared=true
// 4. Set batchEstimation={totalIndicators, estimatedSeconds}
// 5. Ouvre l'aside
```

##### `handleStartCalculation()` (nouveau)
```typescript
// 1. Set isBatchCalculating=true, isBatchPrepared=false
// 2. Appelle /api/ai/calculate-all-missing-stream avec processLogId
// 3. Gère le stream SSE (progress, complete, error)
// 4. Nettoie les états dans finally
```

##### `handleCancelBatchCalculation()` (amélioré)
```typescript
// Si calcul en cours → abort via AbortController
// Si phase de préparation → reset des états (isBatchPrepared, batchEstimation, processLogId)
```

**Props passées à AIAssistant** :
```typescript
<AIAssistant
  // ... props existantes
  isBatchPrepared={isBatchPrepared}
  batchEstimation={batchEstimation}
  onStartCalculation={handleStartCalculation}
/>
```

#### `components/ai-assistant/AIAssistant.tsx`

**Nouveaux props** :
```typescript
interface AIAssistantProps {
  // ... props existantes
  isBatchPrepared?: boolean;
  batchEstimation?: {
    totalIndicators: number;
    estimatedSeconds: number;
  } | null;
  onStartCalculation?: () => void;
}
```

**Helper** : `formatEstimatedTime(seconds: number): string`
- < 60s → "X secondes"
- < 3600s → "X minutes"
- ≥ 3600s → "X heures et Y minutes"

**Rendu conditionnel** :
1. **Phase préparation** (`isBatchPrepared=true && batchEstimation && !isBatchCalculating`) :
   - Card bleue avec info
   - Affichage du nombre d'indicateurs
   - Affichage du temps estimé formaté
   - Bouton "Démarrer le calcul" (appelle `onStartCalculation`)
   - Bouton "Annuler" (appelle `onCancelBatch`)

2. **Phase calcul** (`isBatchCalculating=true`) :
   - Composant `CalculationProgress` existant (barre de progression)

3. **Mode normal** :
   - Affichage standard (conversation, indicateur unique)

## Base de données

### Table `ai_process_log`

**Colonnes pertinentes** :
- `id` : INT AUTO_INCREMENT PRIMARY KEY
- `system_id` : VARCHAR(100)
- `indicator` : VARCHAR(100) (valeur 'all' pour batch)
- `status` : ENUM('started', 'completed', 'failed', 'aborted')
- `total_indicators` : INT NULL (nombre total d'indicateurs à calculer)
- `processed_indicators` : INT DEFAULT 0 (compteur progression)
- `start` : DATETIME
- `end` : DATETIME NULL

**Requête temps estimé** :
```sql
SELECT
  TIMESTAMPDIFF(SECOND, start, end) as duration_seconds,
  processed_indicators
FROM ai_process_log
WHERE indicator = 'all'
  AND status = 'completed'
  AND end IS NOT NULL
  AND processed_indicators > 0
ORDER BY start DESC
LIMIT 5
```

## Gestion des erreurs

### Annulation en phase de préparation
- Reset des états locaux
- Pas d'appel API nécessaire (log déjà créé avec `status='started'`)
- Note : Le log restera `started` → nettoyage futur possible

### Annulation pendant le calcul
- AbortController → cancellation du stream
- Appel `/api/ai/abort-calculation` avec `processLogId`
- Update DB : `status='aborted'`

### Erreurs réseau
- Catch dans `handleCalculateAllMissing()` : affichage alert erreur
- Catch dans `handleStartCalculation()` : affichage alert erreur
- Finally : nettoyage des états (`isBatchCalculating`, `batchEstimation`, etc.)

## Points d'attention

### Closure avec useRef
Le `processLogId` est stocké dans `batchProcessLogIdRef` (useRef) ET dans state `batchProcessLogId` :
- **useRef** : pour les event listeners (abort) qui capturent la valeur au moment de l'ajout
- **state** : pour déclencher re-render si nécessaire

### Timing SSE
`await onProcessStarted(processLogId)` dans `calculateAllMissing()` est critique :
- Garantit que l'événement SSE `started` est envoyé avant de commencer les calculs
- Évite les problèmes de timing où le client reçoit `progress` avant `started`

### Persistance DB
Le calcul sauvegarde le JSON système complet après chaque indicateur :
- Permet reprise en cas d'erreur
- Garantit cohérence des données
- Performance : acceptable car séquentiel (pas de race conditions)

## Tests manuels recommandés

1. **Flow complet** :
   - Cliquer "Calculer tout"
   - Vérifier affichage estimation
   - Cliquer "Démarrer"
   - Observer progression
   - Vérifier completion + reload données

2. **Annulation préparation** :
   - Cliquer "Calculer tout"
   - Cliquer "Annuler" avant "Démarrer"
   - Vérifier reset UI

3. **Annulation calcul** :
   - Démarrer calcul
   - Cliquer "Annuler" pendant progression
   - Vérifier status='aborted' en DB
   - Vérifier reload JSON système

4. **Estimation précise** :
   - Faire plusieurs calculs complets
   - Observer amélioration de l'estimation (basée sur historique)

5. **Système sans indicateurs manquants** :
   - Calculer tout sur système complet
   - Vérifier affichage "0 indicateurs"

## Améliorations futures possibles

1. **Nettoyage logs anciens** :
   - Cron job pour supprimer logs > X jours
   - Ou nettoyer logs `status='started'` orphelins

2. **Estimation par type d'indicateur** :
   - GES plus lent que coût
   - Affiner le temps estimé selon composition

3. **Calcul parallèle** :
   - Pool de workers (avec limite concurrence)
   - Nécessite gestion locks DB plus sophistiquée

4. **Reprise après erreur** :
   - Bouton "Reprendre" si log `status='failed'`
   - Ne calculer que les indicateurs restants

5. **Cache calculs** :
   - Éviter recalculs identiques
   - Cache basé sur hash des hypothèses
