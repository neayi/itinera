# InterventionsDataTable

Ce composant affiche une table interactive des interventions extraites de `systemData` en utilisant TanStack React Table.

## Utilisation

```tsx
import { InterventionsDataTable } from '@/components/interventions-table';

<InterventionsDataTable systemData={systemData} />
```

## Props

- `systemData` (any): Les données du système contenant les steps et interventions

## Structure des données

Le composant extrait les interventions de `systemData.steps[].interventions[]` et calcule la date de chaque intervention en ajoutant `intervention.day` à `step.startDate`.

## Colonnes affichées

Le composant organise les colonnes en groupes pour une meilleure lisibilité:

### Colonnes non groupées
- **Intervention**: Nom de l'intervention (`steps[].interventions[].name`)
- **Description**: Description de l'intervention (`steps[].interventions[].description`)
- **Date**: Date calculée (`steps[].startDate + steps[].interventions[].day`)

### Groupe Agronomie
- **Fréquence**: (vide pour le moment)
- **Azote minéral**: (vide pour le moment)
- **Azote organique**: (vide pour le moment)
- **Rendement**: (vide pour le moment)

### Groupe Environnemental et social
- **IFT**: (vide pour le moment)
- **EIQ**: (vide pour le moment)
- **GES**: (vide pour le moment)
- **Temps de travail**: (vide pour le moment)

### Groupe Économique
- **Coûts phytos**: (vide pour le moment)
- **Semences**: (vide pour le moment)
- **Engrais**: (vide pour le moment)
- **Mécanisation**: (vide pour le moment)
- **GNR**: (vide pour le moment)
- **Irrigation**: (vide pour le moment)
- **Total charges**: (vide pour le moment)
- **Prix de vente**: (vide pour le moment)
- **Marge brute**: (vide pour le moment)

## Fonctionnalités

- ✅ Tri des colonnes (cliquer sur l'en-tête)
- ✅ Colonnes groupées par catégorie (Agronomie, Environnemental et social, Économique)
- ✅ En-têtes de groupe stylisés et visuellement distincts
- ✅ Défilement horizontal et vertical
- ✅ Première colonne (Intervention) fixe lors du défilement horizontal
- ✅ En-tête fixe lors du défilement vertical
- ✅ Responsive design
- ✅ Style moderne avec hover effects

## À venir

Les colonnes marquées comme "(vide pour le moment)" seront remplies progressivement avec les données appropriées.
