# Analyse de l'existant vs Spécification 003

**Date** : 2026-01-16  
**Spec** : [spec.md](./spec.md)

## Vue d'ensemble

Cette analyse compare l'implémentation actuelle avec les requirements de la spec 003 pour identifier les écarts et proposer des tâches d'ajustement.

## ✅ Fonctionnalités déjà implémentées

### Architecture des calculs (P1)

- ✅ **FR-015** : Somme pondérée par fréquence implémentée dans `calculate-step-totals.ts`
- ✅ **FR-016** : Fréquence par défaut = 1 si absent (ligne 48 : `const freq = freqEntry?.value || 1`)
- ✅ **FR-017** : Totaux stockés dans `step.values[]` (ligne 104-107)
- ✅ **FR-021** : SystemIndicators somme depuis step.values (ligne 42-105)
- ✅ **FR-027** : API PATCH appelle calculateAndSaveStepTotals (EditableNumberCell.tsx ligne 169-177)
- ✅ **FR-028** : Rechargement API après save (EditableNumberCell.tsx ligne 181-184)

### Édition des cellules (P1)

- ✅ **FR-005** : Clic sur cellule pour éditer (EditableNumberCell.tsx ligne 53-60)
- ✅ **FR-006** : Curseur pointer (EditableNumberCell.tsx ligne 291 `cursor: 'pointer'`)
- ✅ **FR-008** : reviewed=true lors validation (EditableNumberCell.tsx ligne 113 `setValue(..., true)`)
- ✅ **FR-009** : Recalculs en cascade via calculateAndSaveStepTotals

### Calculs automatiques (P1)

- ✅ **FR-012** : totalCharges calculé automatiquement (EditableNumberCell.tsx ligne 133-140, calculate-step-totals.ts ligne 68-74)
- ✅ **FR-013** : margeBrute calculé automatiquement (calculate-step-totals.ts ligne 96)
- ✅ **FR-014** : status='calculated' implicite (reviewed=true dans step.values ligne 106)

### Indicateurs au niveau étape (P2)

- ✅ **FR-018** : Édition directe irrigation possible (EditableStepValueCell.tsx)
- ✅ **FR-019** : totalProduits forçable (calculate-step-totals.ts ligne 88-93)
- ✅ **FR-020** : Recalculs après modification (calculate-step-totals.ts ligne 68-96)

### Validation (clarifications)

- ✅ **FR-005a** : input type="number" (EditableNumberCell.tsx ligne 212)
- ✅ Validation invalide (ligne 77-80 : alert si isNaN)

## ⚠️ Écarts critiques identifiés

### 1. Système de statuts incomplet (FR-001 à FR-004)

**Spec attendue** :
- 5 états : vide, 'n/a', 'ia', 'user', 'calculated'
- Champ `status` dans values[]
- Champ `reviewed` pour distinguer validation

**Implémentation actuelle** :
- ❌ Pas de champ `status` dans les valeurs
- ⚠️ Champ `reviewed` existe mais seulement booléen ou 'n/a' (pas de distinction ia/user/calculated)
- ❌ Pas de distinction entre valeur IA non validée (status='ia') et valeur validée (status='user')
- ❌ calculate-step-totals.ts marque toutes les valeurs calculées avec `reviewed: true` (ligne 106) alors qu'elles devraient avoir `status: 'calculated'`

**Impact** :
- Impossible de différencier les sources de données (IA vs calcul vs utilisateur)
- Codes couleur non implémentables (FR-002)
- Pas de traçabilité pour l'audit

---

### 2. Codes couleur des cellules manquants (FR-002)

**Spec attendue** :
- Blanc : vide
- Gris n/a : status='n/a'
- Bleu clair : status='ia' + confidence='high'
- Jaune : status='ia' + confidence='medium'/'low'
- Blanc : status='user' ou 'calculated'

**Implémentation actuelle** :
- ⚠️ Classe CSS `.needsReview` existe (ligne 267) → fond bleu clair (#e0f2fe) pour `reviewed !== true && reviewed !== 'n/a'`
- ❌ Pas de distinction par niveau de confidence
- ❌ Pas de gris pour n/a
- ❌ Logique basée sur `reviewed` au lieu de `status`

**Fichiers concernés** :
- `EditableNumberCell.tsx` (ligne 267-305)
- `interventions-table.scss` (ligne 146-148)

---

### 3. Assistant IA non affiché au clic (FR-007)

**Spec attendue** :
- FR-007 : Afficher l'assistant IA avec historique lors du clic sur cellule

**Implémentation actuelle** :
- ✅ Callback `onCellFocus` appelé (ligne 58)
- ❌ Assistant IA non visible dans la démo (à vérifier si composant existe)

---

### 4. Gestion fréquence=0 non implémentée (FR-016a)

**Spec attendue** :
- FR-016a : Exclure interventions avec fréquence=0 des totaux

**Implémentation actuelle** :
- ❌ Pas de vérification `if (freq === 0) continue;` dans calculate-step-totals.ts
- ✅ Fréquences décimales supportées (0<f<1)

---

### 5. Gestion step.values manquant non robuste (FR-021)

**Spec attendue** :
- FR-021 : Si step.values manquant, traiter comme zéro (contribution nulle)

**Implémentation actuelle** :
- ⚠️ SystemIndicators.tsx log erreur (ligne 48-51) mais continue
- ❌ InterventionsDataTable.tsx recalcule localement au lieu de traiter comme zéro (ligne 82-95)

---

## 📋 Tâches proposées

### Priority P1 - Système de statuts et codes couleur

#### Task 1.1 : Ajouter champ status dans le data model

**Objectif** : Implémenter FR-001, FR-003

**Fichiers à modifier** :
- `lib/types.ts` : Ajouter type `ValueStatus = 'empty' | 'n/a' | 'ia' | 'user' | 'calculated'`
- `lib/types.ts` : Ajouter champ `status?: ValueStatus` dans `InterventionValue` interface

**Validation** :
```typescript
interface InterventionValue {
  key: string;
  value: number;
  status?: 'empty' | 'n/a' | 'ia' | 'user' | 'calculated';
  reviewed?: boolean | 'n/a';
  confidence?: 'high' | 'medium' | 'low';
  conversation?: ConversationMessage[];
}
```

---

#### Task 1.2 : Mettre à jour calculate-step-totals.ts pour utiliser status

**Objectif** : Implémenter FR-014

**Modifications** :
```typescript
// ligne 106 - Remplacer
reviewed: true,

// Par
status: 'calculated',
reviewed: true,
```

**Fichiers** : `lib/calculate-step-totals.ts`

---

#### Task 1.3 : Mettre à jour EditableNumberCell pour status='user'

**Objectif** : Implémenter FR-008

**Modifications** :
```typescript
// ligne 113 - Remplacer
setValue(fieldKey, finalValue, true);

// Par
const setValue = (key: string, value: number, status: ValueStatus = 'user', reviewed: boolean = true) => {
  // ...
  intervention.values[idx].status = status;
  intervention.values[idx].reviewed = reviewed;
  // ...
}
setValue(fieldKey, finalValue, 'user', true);
```

**Fichiers** : `components/interventions-table/EditableNumberCell.tsx`

---

#### Task 1.4 : Implémenter les codes couleur selon status et confidence

**Objectif** : Implémenter FR-002

**Modifications dans EditableNumberCell.tsx** :
```typescript
// Remplacer ligne 267
const needsReview = reviewed !== true && reviewed !== 'n/a';

// Par fonction plus sophistiquée
const getCellStyle = (): { backgroundColor?: string; color?: string } => {
  // Récupérer status depuis intervention.values
  const valueEntry = intervention.values?.find((v: any) => v.key === fieldKey);
  const status = valueEntry?.status;
  const confidence = valueEntry?.confidence;
  
  if (status === 'n/a') {
    return { backgroundColor: '#f3f4f6', color: '#9ca3af' }; // Gris
  }
  
  if (status === 'ia') {
    if (confidence === 'high') {
      return { backgroundColor: '#dbeafe' }; // Bleu clair
    } else {
      return { backgroundColor: '#fef3c7' }; // Jaune
    }
  }
  
  // status='user' ou 'calculated' ou vide : fond blanc
  return {};
};
```

**Modifications dans interventions-table.scss** :
```scss
// Remplacer ligne 146-148
&:has(.needsReview) {
    background-color: #e0f2fe;
}

// Par
&:has(.status-na) {
    background-color: #f3f4f6;
    color: #9ca3af;
}

&:has(.status-ia-high) {
    background-color: #dbeafe;
}

&:has(.status-ia-medium), &:has(.status-ia-low) {
    background-color: #fef3c7;
}
```

**Fichiers** :
- `components/interventions-table/EditableNumberCell.tsx`
- `components/interventions-table/interventions-table.scss`

---

### Priority P2 - Robustesse et edge cases

#### Task 2.1 : Exclure fréquence=0 des totaux

**Objectif** : Implémenter FR-016a

**Modifications dans calculate-step-totals.ts** :
```typescript
// Ajouter après ligne 48
const freq = freqEntry?.value || 1;

// Ajouter ligne 49
if (freq === 0) return; // Exclure intervention avec fréquence=0
```

**Fichiers** : `lib/calculate-step-totals.ts`

---

#### Task 2.2 : Traiter step.values manquant comme zéro

**Objectif** : Implémenter FR-021

**Modifications dans SystemIndicators.tsx** :
```typescript
// Remplacer ligne 48-51
if (!step.values || step.values.length === 0) {
  console.error(`[SystemIndicators] step.values is missing for step ${stepIndex} (${step.name})`);
  console.error('[SystemIndicators] Data should be recalculated via calculate-step-totals.ts');
  return; // <-- Cause contribution nulle automatiquement
}
```

**Modifications dans InterventionsDataTable.tsx** :
```typescript
// Supprimer le recalcul local ligne 82-95 et remplacer par
stepLevelEditableFields.forEach((field) => {
  const stepValue = getStepLevelValue(step, field);
  if (stepValue !== undefined) {
    (stepTotals as any)[field] = stepValue;
  }
  // Si step.values manquant, stepValue reste 0 (initialisé ligne 64)
});
```

**Fichiers** :
- `components/SystemIndicators.tsx`
- `components/interventions-table/InterventionsDataTable.tsx`

---

#### Task 2.3 : Valider calcul totalProduits=0 acceptable

**Objectif** : Vérifier FR-011 (zéro valide)

**Test manuel** :
1. Créer intervention avec prixVente=0
2. Vérifier que totalProduits=0 (pas d'erreur)
3. Vérifier que l'utilisateur peut forcer une valeur via EditableStepValueCell

**Aucune modification code nécessaire** - déjà implémenté

---

### Priority P3 - Assistant IA (à vérifier)

#### Task 3.1 : Vérifier affichage Assistant IA au clic

**Objectif** : Valider FR-007

**Action** :
- Tester si le composant AI Assistant s'affiche lors du clic sur une cellule
- Vérifier que `onCellFocus` déclenche bien l'ouverture du panel
- Si manquant, implémenter l'affichage du composant `AIAssistant` avec conversation

**Fichiers à vérifier** :
- `components/InterventionsTable.tsx` (composant parent qui gère onCellFocus)
- `components/ai-assistant/AIAssistant.tsx`

---

## 📊 Résumé des écarts

| Requirement | Statut | Priorité | Effort |
|-------------|--------|----------|--------|
| FR-001 à FR-004 (statuts) | ❌ Manquant | P1 | Medium (4h) |
| FR-002 (codes couleur) | ⚠️ Partiel | P1 | Medium (3h) |
| FR-007 (Assistant IA) | ❓ À vérifier | P3 | Small (1h) |
| FR-016a (fréquence=0) | ❌ Manquant | P2 | Small (30min) |
| FR-021 (step.values manquant) | ⚠️ Partiel | P2 | Small (1h) |

**Effort total estimé** : ~10h

---

## 🎯 Recommandations

### Phase 1 - Système de statuts (P1)
1. Task 1.1 : Ajouter champ status (1h)
2. Task 1.2 : Mettre à jour calculate-step-totals (30min)
3. Task 1.3 : Mettre à jour EditableNumberCell (1h)
4. Task 1.4 : Implémenter codes couleur (3h)

**Total Phase 1** : ~5.5h

### Phase 2 - Robustesse (P2)
5. Task 2.1 : Exclure fréquence=0 (30min)
6. Task 2.2 : Traiter step.values manquant (1h)

**Total Phase 2** : ~1.5h

### Phase 3 - Vérification (P3)
7. Task 2.3 : Test totalProduits=0 (15min)
8. Task 3.1 : Vérifier Assistant IA (1h)

**Total Phase 3** : ~1.25h

---

## 📝 Notes techniques

### Compatibilité ascendante

Les modifications proposées sont **rétrocompatibles** :
- Ajout de champ `status` optionnel (données existantes sans status fonctionnent)
- Champ `reviewed` conservé pour compatibilité spec 001
- Pas de migration de données nécessaire

### Migration progressive

Les données existantes sans champ `status` seront traitées ainsi :
- Si `reviewed === true` → considérer comme `status='user'`
- Si `reviewed === false` et `confidence` existe → `status='ia'`
- Si valeur calculée (dans step.values) → `status='calculated'`

### Tests recommandés

1. **Test unitaire** : calculate-step-totals.ts avec fréquence=0
2. **Test UI** : Codes couleur selon status et confidence
3. **Test intégration** : Cascade de recalculs après édition
4. **Test edge case** : step.values manquant → contribution nulle

---

## 🔗 Références

- [Spec 003](./spec.md) - Spécification complète
- [Spec 001 data-model](../001-ai-assistant-indicators/data-model.md) - Structure des données (confidence, conversation)
- [Spec 002](../002-system-indicators-calculation/README.md) - Architecture des calculs
