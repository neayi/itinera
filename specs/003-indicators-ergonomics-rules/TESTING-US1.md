# T012: Tests manuels User Story 1 - Visualisation des statuts

## Prérequis
- Application démarrée avec Docker: `docker compose up`
- URL: http://localhost:3000/
- Ouvrir un système de culture avec des interventions

## Scénarios d'acceptance (spec.md, User Story 1)

### ✅ Scénario 1: Cellule vide (non calculée)
**Étapes:**
1. Ouvrir un système avec interventions
2. Trouver une cellule d'indicateur vide (par ex. "ges" non rempli)

**Résultat attendu:**
- Fond blanc (pas de classe CSS appliquée)
- Affiche "-" ou cellule vide
- Clic ouvre l'assistant IA

**Status:** [ ] À tester

---

### ✅ Scénario 2: Cellule avec valeur calculée automatiquement
**Étapes:**
1. Ouvrir un système
2. Identifier une cellule avec valeur calculée (par ex. "totalCharges" au niveau étape)

**Résultat attendu:**
- Fond blanc (classe CSS vide car status='calculated')
- Valeur affichée normalement
- Pas de distinction visuelle avec les valeurs manuelles

**Status:** [ ] À tester

---

### ✅ Scénario 3: Cellule avec valeur manuelle (saisie utilisateur)
**Étapes:**
1. Cliquer sur une cellule d'indicateur
2. Saisir une valeur manuellement (par ex. ges = 50)
3. Valider avec ✓

**Résultat attendu:**
- Après sauvegarde: fond blanc (status='user')
- Valeur conservée lors des recalculs
- Pas de distinction visuelle avec les valeurs calculées

**Status:** [ ] À tester

---

### ✅ Scénario 4: Cellule avec valeur calculée par IA
**Étapes:**
1. Utiliser l'assistant IA pour calculer un indicateur
2. Obtenir une valeur avec confiance haute (confidence='high')

**Résultat attendu:**
- Fond bleu clair (#dbeafe) - classe `status-ia-high`
- Valeur affichée normalement
- Clic ouvre l'assistant avec historique de conversation

**Status:** [ ] À tester (nécessite intégration IA)

---

### ✅ Scénario 5: Cellule IA avec confiance moyenne/basse
**Étapes:**
1. Obtenir une valeur IA avec confidence='medium' ou 'low'

**Résultat attendu:**
- Fond jaune (#fef3c7) - classe `status-ia-medium` ou `status-ia-low`
- Indicateur visuel de faible confiance
- Utilisateur sait qu'il doit vérifier cette valeur

**Status:** [ ] À tester (nécessite intégration IA)

---

## Tests des classes CSS

### Test couleurs de fond

**Procédure:**
1. Ouvrir DevTools (F12)
2. Inspecter une cellule d'indicateur
3. Vérifier que la classe CSS appliquée correspond au statut

**Vérifications:**

| Statut | Confiance | Classe CSS attendue | Couleur de fond |
|--------|-----------|---------------------|-----------------|
| `undefined` | - | `` (aucune) | Blanc |
| `calculated` | - | `` (aucune) | Blanc |
| `user` | - | `` (aucune) | Blanc |
| `ia` | `high` | `status-ia-high` | #dbeafe (bleu clair) |
| `ia` | `medium` | `status-ia-medium` | #fef3c7 (jaune) |
| `ia` | `low` | `status-ia-low` | #fef3c7 (jaune) |
| `n/a` | - | `status-na` | #f3f4f6 (gris) |

**Status:** [ ] À tester

---

## Tests de préservation du statut

### Test 1: Status 'user' préservé lors des recalculs
**Étapes:**
1. Éditer manuellement une cellule (par ex. ges = 100)
2. Éditer une autre cellule qui déclenche un recalcul
3. Vérifier que ges = 100 n'a pas changé

**Résultat attendu:**
- Valeur manuelle conservée (status='user' préservé)
- Pas d'écrasement par le calcul automatique

**Status:** [ ] À tester

---

### Test 2: Status 'ia' préservé lors des recalculs
**Étapes:**
1. Obtenir une valeur calculée par IA (status='ia')
2. Éditer une autre cellule déclenchant recalcul
3. Vérifier que la valeur IA n'est pas écrasée

**Résultat attendu:**
- Valeur IA conservée avec status='ia'
- Fond bleu clair ou jaune selon confiance

**Status:** [ ] À tester (nécessite intégration IA)

---

## Tests edge cases

### Edge case 1: Statut 'n/a' (non applicable)
**Étapes:**
1. Identifier un indicateur non applicable pour une intervention
2. Marquer avec status='n/a' (nécessite modification manuelle ou API)

**Résultat attendu:**
- Fond gris (#f3f4f6) - classe `status-na`
- Indicateur visuellement distinct

**Status:** [ ] À tester (nécessite données de test)

---

### Edge case 2: Changement de statut 'ia' → 'user'
**Étapes:**
1. Obtenir une valeur IA (fond bleu/jaune)
2. Cliquer et modifier manuellement la valeur
3. Valider

**Résultat attendu:**
- Après sauvegarde: status='user', fond blanc
- Conversation IA préservée dans l'historique
- Message ajouté: "Modification manuelle : {ancien} → {nouveau}"

**Status:** [ ] À tester (nécessite intégration IA)

---

## Validation Success Criteria

### SC-001: Identification visuelle en <2 secondes
**Test:**
1. Ouvrir un système avec mix de valeurs (calculées, manuelles, IA)
2. Chronométrer le temps pour identifier visuellement 3 cellules IA

**Résultat attendu:**
- < 2 secondes pour identifier visuellement le type de chaque cellule
- Distinction claire entre calculé/user (blanc) et IA (bleu/jaune)

**Status:** [ ] À tester

---

## Résumé des tests

- [ ] Scénario 1: Cellule vide
- [ ] Scénario 2: Valeur calculée
- [ ] Scénario 3: Valeur manuelle
- [ ] Scénario 4: Valeur IA haute confiance
- [ ] Scénario 5: Valeur IA confiance moyenne/basse
- [ ] Test couleurs CSS
- [ ] Préservation status='user'
- [ ] Préservation status='ia'
- [ ] Edge case status='n/a'
- [ ] Edge case changement 'ia' → 'user'
- [ ] SC-001: Identification <2s

**Notes:**
- Tests IA (Scénarios 4, 5, edge cases 2) nécessitent l'intégration avec spec 001 (AI Assistant)
- Certains tests peuvent être effectués avec des données de test modifiées manuellement dans la console

---

## Comment exécuter les tests

### Méthode 1: Interface utilisateur normale
1. Démarrer l'application: `docker compose up`
2. Naviguer vers un système de culture
3. Suivre les étapes de chaque scénario

### Méthode 2: Console DevTools (pour tests avancés)
```javascript
// Exemple: Forcer un statut 'ia' pour tester l'affichage
const intervention = systemData.steps[0].interventions[0];
intervention.values[0].status = 'ia';
intervention.values[0].confidence = 'high';
// Déclencher le re-render...
```

### Méthode 3: Données de test SQL
```sql
-- Ajouter des valeurs avec différents statuts dans la base
UPDATE systems 
SET json = JSON_SET(json, '$.steps[0].interventions[0].values[0].status', 'ia')
WHERE id = 1;
```
