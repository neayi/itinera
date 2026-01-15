# Calcul des indicateurs système consolidés

## Règle fondamentale

**Les indicateurs système (totaux) doivent TOUJOURS être calculés en sommant les valeurs au niveau des ÉTAPES (`step.values`), JAMAIS au niveau des interventions.**

## Pourquoi cette règle ?

1. **Pondération par fréquence** : Les valeurs au niveau des interventions sont des valeurs unitaires (par passage). Elles doivent être multipliées par la fréquence de l'intervention pour obtenir le total de l'étape.

2. **Source de vérité unique** : `step.values` contient les totaux pré-calculés avec la bonne pondération via `calculate-step-totals.ts`. C'est la source de vérité.

3. **Cohérence des données** : Tous les calculs de totaux doivent utiliser la même méthode pour éviter les incohérences.

## Architecture

```
Intervention.values (unitaire par passage)
    ↓ multiply by frequence
Step.values (total pondéré pour l'étape) ← SOURCE DE VÉRITÉ
    ↓ sum across steps
System totals (total pour tout le système)
```

## Implémentation

### Fichiers concernés

1. **`lib/calculate-step-totals.ts`**
   - Fonction : `calculateAndSaveStepTotals()`
   - Responsabilité : Calculer `step.values` depuis les interventions avec pondération par fréquence
   - Appelé par : API PATCH `/api/systems/[id]`

2. **`components/SystemIndicators.tsx`**
   - Fonction : `calculateTotals()`
   - Responsabilité : Sommer `step.values` pour obtenir les totaux système
   - **INTERDIT** : Calculer depuis `intervention.values`

### Exemple de calcul GES

#### Données interventions
```javascript
step.interventions = [
  { name: "Labour", values: [{ key: "ges", value: 50 }, { key: "frequence", value: 1 }] },
  { name: "Semis", values: [{ key: "ges", value: 30 }, { key: "frequence", value: 2 }] }
]
```

#### Calcul step.values (dans calculate-step-totals.ts)
```javascript
// Labour: 50 × 1 = 50
// Semis: 30 × 2 = 60
// Total: 50 + 60 = 110
step.values = [{ key: "ges", value: 110 }]
```

#### Calcul total système (dans SystemIndicators.tsx)
```javascript
// Sum step.values across all steps
totalGES = step1.values.ges + step2.values.ges + ...
```

## Flux de données après modification

1. **Utilisateur modifie une valeur GES** dans `EditableNumberCell`
2. **API PATCH** `/api/systems/[id]` reçoit les données modifiées
3. **`calculateAndSaveStepTotals()`** recalcule `step.values` avec pondération
4. **Sauvegarde en base** des données mises à jour
5. **`SystemIndicators`** recalcule les totaux depuis `step.values`
6. **Affichage mis à jour** avec les bons totaux

## Erreurs courantes à éviter

❌ **MAUVAIS** : Calculer depuis les interventions
```typescript
// NE PAS FAIRE ÇA
step.interventions.forEach(intervention => {
  totalGES += intervention.values.find(v => v.key === 'ges').value;
});
```

✅ **BON** : Utiliser step.values
```typescript
// FAIRE ÇA
step.values.forEach(valueEntry => {
  if (valueEntry.key === 'ges') {
    totalGES += valueEntry.value;
  }
});
```

## Tests

Pour vérifier que le calcul fonctionne correctement :

1. Modifier une valeur GES dans une intervention
2. Vérifier dans les logs que `calculate-step-totals.ts` est appelé
3. Vérifier que `step.values` contient la nouvelle valeur pondérée
4. Vérifier que `SystemIndicators` affiche le bon total

## Voir aussi

- `lib/calculate-step-totals.ts` - Calcul des totaux d'étape
- `components/SystemIndicators.tsx` - Affichage des totaux système
- `components/interventions-table/EditableNumberCell.tsx` - Édition des valeurs
