# Valeurs éditables au niveau de l'étape

## Vue d'ensemble

Certains indicateurs peuvent maintenant être modifiés directement au niveau de l'étape plutôt qu'uniquement au niveau des interventions individuelles.

## Indicateurs concernés

Trois indicateurs sont maintenant éditables au niveau de l'étape :

1. **Irrigation** : Coût lié à l'infrastructure de la parcelle, pas à une intervention spécifique
2. **Rendement (rendementTMS)** : Peut être saisi soit au niveau de l'intervention Récolte/Moisson, soit au niveau de l'étape
3. **Prix de vente (prixVente)** : Généralement saisi à côté du rendement, soit au niveau de l'étape soit au niveau d'une intervention

## Calculs automatiques

### Total des charges (totalCharges)

La colonne `totalCharges` est **calculée automatiquement** à partir de :
- coutsPhytos
- semences
- engrais
- mecanisation
- gnr
- irrigation

**Au niveau des interventions :**
Quand vous modifiez une de ces valeurs dans une intervention, `totalCharges` est automatiquement recalculé pour cette intervention.

**Au niveau de l'étape :**
Le total est recalculé en additionnant tous les composants. Si `irrigation` est défini au niveau de l'étape, cette valeur est utilisée dans le calcul du total au lieu de la somme des irrigations des interventions.

Formule : `totalCharges = coutsPhytos + semences + engrais + mecanisation + gnr + irrigation`

## Logique de calcul

### Calcul par défaut (somme pondérée)
Par défaut, la valeur au niveau de l'étape est calculée par somme pondérée des valeurs des interventions :
```
valeur_étape = Σ (valeur_intervention × fréquence)
```

### Saisie au niveau de l'étape
Lorsqu'une valeur est saisie directement au niveau de l'étape :
- La valeur saisie remplace le calcul par somme pondérée
- Les valeurs au niveau des interventions restent inchangées
- Le total affiché correspond à la valeur saisie au niveau de l'étape

### Écrasement de la valeur d'étape
Si une valeur existe au niveau de l'étape ET qu'on modifie cette valeur au niveau d'une intervention :
- La valeur au niveau de l'étape est supprimée
- Le calcul par somme pondérée est restauré automatiquement
- Le total redevient la somme des valeurs des interventions (pondérées par fréquence)

## Structure des données

### Valeurs au niveau de l'intervention
Les valeurs des interventions sont stockées dans `intervention.values[]` :
```json
{
  "interventions": [
    {
      "id": "uuid",
      "name": "Irrigation goutte à goutte",
      "values": [
        {"key": "irrigation", "value": 150, "reviewed": true}
      ]
    }
  ]
}
```

### Valeurs au niveau de l'étape
Les valeurs au niveau de l'étape sont stockées dans `step.stepValues[]` :
```json
{
  "steps": [
    {
      "id": "step1",
      "name": "Orge + Lupin",
      "stepValues": [
        {"key": "irrigation", "value": 300},
        {"key": "rendementTMS", "value": 45.5}
      ],
      "interventions": [...]
    }
  ]
}
```

## Composants

### EditableStepValueCell
Nouveau composant permettant d'éditer les valeurs au niveau de l'étape sur les lignes de totaux.

**Props :**
- `value`: Valeur actuelle
- `stepIndex`: Index de l'étape
- `systemId`: ID du système
- `systemData`: Données complètes du système
- `fieldKey`: Clé du champ (irrigation, rendementTMS, prixVente)
- `onUpdate`: Callback après mise à jour

**Utilisation :**
Le composant est automatiquement affiché pour les colonnes `irrigation`, `rendementTMS` et `prixVente` sur les lignes de totaux (step-total-row).

### EditableNumberCell (modifié)
Le composant a été modifié pour gérer l'écrasement automatique des valeurs d'étape :
- Détecte si le champ édité fait partie des `stepLevelEditableFields`
- Supprime automatiquement la valeur au niveau de l'étape lors de la sauvegarde
- Restaure le calcul par somme pondérée

## Exemple d'utilisation

### Scénario 1 : Saisie au niveau de l'étape
1. Cliquer sur la cellule "Irrigation" dans la ligne de total d'une étape
2. Saisir la valeur (ex: 300 €)
3. La valeur est stockée dans `step.stepValues`
4. Les interventions conservent leurs valeurs individuelles, mais le total affiché est 300 €

### Scénario 2 : Modification d'une intervention avec valeur d'étape existante
1. Une valeur d'irrigation existe au niveau de l'étape (300 €)
2. Modifier la valeur d'irrigation d'une intervention (ex: passer de 0 à 50 €)
3. La valeur au niveau de l'étape est automatiquement supprimée
4. Le total redevient la somme pondérée des interventions

### Scénario 3 : Rendement sur intervention Récolte
1. Créer une intervention "Récolte"
2. Saisir le rendement directement sur cette intervention (ex: 45 qtx/ha)
3. Le total au niveau de l'étape est calculé automatiquement
4. Si on veut saisir un rendement global différent, on peut éditer la ligne de total

## Tests recommandés

1. ✓ Saisir une valeur au niveau de l'étape et vérifier qu'elle s'affiche correctement
2. ✓ Modifier une intervention et vérifier que la valeur d'étape est écrasée
3. ✓ Vérifier que les autres colonnes continuent d'utiliser la somme pondérée
4. ✓ Tester avec plusieurs étapes et plusieurs interventions
5. ✓ Vérifier la persistance après rechargement de la page
