# Feature Specification: Règles de calcul des indicateurs et ergonomie du tableau

**Feature Branch**: `003-indicators-ergonomics-rules`  
**Created**: 2026-01-16  
**Status**: Draft  
**Input**: User description: "Spécifier les règles de calcul des indicateurs et l'ergonomie du tableau d'interventions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualiser l'état des cellules du tableau (Priority: P1)

L'utilisateur doit pouvoir identifier visuellement l'état de chaque cellule pour savoir si la valeur a été calculée par IA, validée, ou si elle nécessite une action.

**Why this priority**: Essentiel pour que l'utilisateur comprenne la provenance des données et identifie rapidement les valeurs à valider.

**Independent Test**: Ouvrir un système avec des interventions variées et vérifier que les codes couleur correspondent aux statuts (blanc=non calculé, bleu clair=IA haute confiance, jaune=IA confiance moyenne/basse, blanc=user ou calculated, gris=n/a)

**Acceptance Scenarios**:

1. **Given** une cellule sans valeur calculée, **When** je visualise le tableau, **Then** la cellule affiche un tiret sur fond blanc
2. **Given** une cellule avec valeur n/a, **When** je visualise le tableau, **Then** la cellule affiche "n/a" en gris sur fond blanc
3. **Given** une cellule avec valeur IA non validée (confiance haute), **When** je visualise le tableau, **Then** la cellule affiche la valeur sur fond bleu clair
4. **Given** une cellule avec valeur IA non validée (confiance moyenne/basse), **When** je visualise le tableau, **Then** la cellule affiche la valeur sur fond jaune clair
5. **Given** une cellule avec valeur validée ou calculée, **When** je visualise le tableau, **Then** la cellule affiche la valeur sur fond blanc

---

### User Story 2 - Éditer une cellule d'intervention (Priority: P1)

L'utilisateur doit pouvoir cliquer sur une cellule éditable pour modifier sa valeur, ce qui déclenche le recalcul en cascade des valeurs dépendantes.

**Why this priority**: Fonctionnalité centrale permettant à l'utilisateur de corriger ou saisir des valeurs et de voir immédiatement l'impact sur les totaux.

**Independent Test**: Cliquer sur une cellule "ges" d'une intervention, modifier la valeur, valider, et vérifier que le total de l'étape et les indicateurs système sont mis à jour automatiquement.

**Acceptance Scenarios**:

1. **Given** une cellule éditable d'intervention, **When** je clique sur la cellule, **Then** elle entre en mode édition et l'assistant IA s'affiche avec l'historique
2. **Given** une cellule en mode édition, **When** je modifie la valeur et valide, **Then** la valeur est enregistrée avec status='user' et reviewed=true
3. **Given** une modification d'une cellule simple (ex: ges), **When** je valide, **Then** les totaux de l'étape (somme pondérée par fréquence) sont recalculés automatiquement
4. **Given** une modification affectant un total calculé, **When** je valide, **Then** totalCharges et margeBrute sont recalculés automatiquement
5. **Given** une modification au niveau intervention, **When** je valide, **Then** les indicateurs consolidés (SystemIndicators) sont mis à jour

---

### User Story 3 - Pondération par fréquence (Priority: P1)

Le système doit multiplier automatiquement les valeurs des interventions par leur fréquence lors du calcul des totaux d'étape.

**Why this priority**: Essentiel pour la précision des calculs - une intervention répétée plusieurs fois doit être comptabilisée proportionnellement.

**Independent Test**: Créer une intervention avec fréquence=2, saisir ges=50, et vérifier que le total étape inclut 100 (50×2).

**Acceptance Scenarios**:

1. **Given** une intervention avec fréquence=2 et ges=50, **When** le total étape est calculé, **Then** la contribution de cette intervention est 100
2. **Given** une intervention sans champ fréquence, **When** le total est calculé, **Then** la fréquence par défaut de 1 est utilisée
3. **Given** plusieurs interventions avec fréquences variables, **When** les totaux sont calculés, **Then** chaque valeur est pondérée par sa fréquence respective

---

### User Story 4 - Forcer la valeur totalProduits (Priority: P2)

L'utilisateur doit pouvoir forcer manuellement la valeur de totalProduits au niveau d'une étape, ce qui désactive le calcul automatique (prixVente × rendementTMS).

**Why this priority**: Permet à l'utilisateur d'ajuster manuellement les produits totaux dans des cas particuliers (aides, subventions, etc.)

**Independent Test**: Éditer directement totalProduits au niveau d'une étape, saisir une valeur, et vérifier que cette valeur reste fixe même si prixVente ou rendementTMS changent.

**Acceptance Scenarios**:

1. **Given** totalProduits au niveau étape, **When** je saisis une valeur manuellement, **Then** status passe à 'user' et la valeur ne change plus automatiquement
2. **Given** totalProduits forcé (status='user'), **When** je modifie prixVente ou rendementTMS, **Then** totalProduits reste inchangé
3. **Given** totalProduits forcé (status='user'), **When** je remets la valeur à zéro ou vide, **Then** status repasse à 'calculated' et le calcul automatique reprend
4. **Given** totalProduits forcé, **When** margeBrute est calculé, **Then** utilise la valeur forcée de totalProduits

---

### User Story 5 - Éditer des indicateurs au niveau étape (Priority: P2)

Pour certains indicateurs (semences, irrigation), l'utilisateur doit pouvoir modifier directement la valeur au niveau de l'étape plutôt que par somme des interventions.

**Why this priority**: Offre plus de flexibilité pour des coûts globaux qui ne se décomposent pas facilement en interventions individuelles.

**Independent Test**: Modifier directement la valeur "semences" au niveau d'une étape et vérifier que cette valeur remplace la somme pondérée des interventions.

**Acceptance Scenarios**:

1. **Given** l'indicateur semences ou irrigation au niveau étape, **When** je clique pour éditer, **Then** je peux saisir une valeur qui remplace la somme pondérée
2. **Given** semences édité au niveau étape, **When** je modifie une intervention, **Then** la valeur manuelle au niveau étape reste prioritaire
3. **Given** une valeur éditée au niveau étape, **When** je la remets à zéro, **Then** le système repasse au calcul par somme pondérée des interventions

---

### Edge Cases

- Que se passe-t-il si l'utilisateur saisit une valeur non numérique dans une cellule ? → **Clarifié : validation HTML5 avec input type="number" empêche la saisie de caractères non numériques**
- Comment le système gère-t-il une fréquence de 0 ou négative ? → **Clarifié : fréquence=0 exclut l'intervention des totaux (contribution nulle), fréquences décimales 0<f<1 acceptées (ex: 0.5 = une année sur deux)**
- Que se passe-t-il si rendementTMS ou prixVente sont à zéro lors du calcul de totalProduits ? → **Clarifié : calcul normal (0 × n = 0), résultat zéro est valide, utilisateur peut forcer via status='user' si nécessaire**
- Comment distinguer visuellement une cellule calculée d'une cellule validée (toutes deux sur fond blanc) ? → **Clarifié : pas de distinction visuelle nécessaire, les deux sont considérées comme valeurs finales**
- Que se passe-t-il si step.values est manquant ou vide pour une étape ? → **Clarifié : traiter comme zéro (contribution nulle de cette étape aux indicateurs système)**

## Requirements *(mandatory)*

### Functional Requirements - Statuts des cellules

- **FR-001**: System MUST supporter 5 états de cellule : vide (non calculé), 'n/a' (non applicable), 'ia' (calculé par IA), 'user' (validé/saisi), 'calculated' (résultat de calcul)
- **FR-002**: System MUST afficher un code couleur distinct pour chaque statut : blanc pour vide, gris n/a, bleu clair pour IA haute confiance, jaune pour IA confiance moyenne/basse, blanc pour user/calculated (pas de distinction visuelle entre 'user' et 'calculated', les deux sont considérées comme valeurs finales)
- **FR-003**: System MUST stocker le statut dans le champ `status` de chaque objet dans `values[]`
- **FR-004**: System MUST stocker le flag `reviewed` (true/false) pour distinguer les valeurs validées

### Functional Requirements - Édition des cellules

- **FR-005**: System MUST permettre de cliquer sur toute cellule éditable pour entrer en mode édition
- **FR-005a**: System MUST utiliser validation HTML5 (input type="number") pour empêcher la saisie de caractères non numériques
- **FR-006**: System MUST afficher un curseur "pointer" au survol des cellules éditables
- **FR-007**: System MUST afficher l'assistant IA avec l'historique lors du clic sur une cellule
- **FR-008**: System MUST mettre `reviewed=true` et `status='user'` lors de la validation d'une modification utilisateur
- **FR-009**: System MUST déclencher automatiquement les recalculs en cascade après toute modification

### Functional Requirements - Indicateurs au niveau intervention

- **FR-010**: System MUST supporter les indicateurs simples : frequence, azoteMineral, azoteOrganique, rendementTMS, ift, eiq, ges, tempsTravail, coutsPhytos, semences, engrais, mecanisation, gnr, irrigation, prixVente
- **FR-011**: System MUST calculer automatiquement `totalProduits = prixVente × rendementTMS` sauf si status='user' au niveau étape. Si prixVente ou rendementTMS = 0, le résultat 0 est valide (utilisateur peut forcer via status='user')
- **FR-012**: System MUST calculer automatiquement `totalCharges = coutsPhytos + semences + engrais + mecanisation + gnr + irrigation` (non éditable)
- **FR-013**: System MUST calculer automatiquement `margeBrute = totalProduits - totalCharges` (non éditable)
- **FR-014**: System MUST assigner `status='calculated'` aux indicateurs calculés automatiquement

### Functional Requirements - Indicateurs au niveau étape

- **FR-015**: System MUST calculer les totaux d'étape par somme pondérée : valeur_étape = Σ(valeur_intervention × fréquence_intervention)
- **FR-016**: System MUST utiliser une fréquence par défaut de 1 si le champ fréquence est absent
- **FR-016a**: System MUST exclure les interventions avec fréquence=0 des totaux (contribution nulle), et accepter les fréquences décimales 0<f<1 (ex: 0.5 = une année sur deux)
- **FR-017**: System MUST stocker les totaux d'étape dans `step.values[]` (source unique de vérité)
- **FR-018**: System MUST permettre l'édition directe de semences et irrigation au niveau étape
- **FR-019**: System MUST permettre de forcer totalProduits au niveau étape (status='user' désactive le calcul automatique)
- **FR-020**: System MUST recalculer totalCharges et margeBrute au niveau étape après toute modification

### Functional Requirements - Indicateurs système consolidés

- **FR-021**: System MUST calculer les indicateurs système en sommant les valeurs de toutes les étapes (via step.values). Si step.values est manquant ou vide pour une étape, traiter comme contribution nulle (zéro)
- **FR-022**: System MUST calculer nbYears comme la durée totale du système (dernière date de fin - première date de début)
- **FR-023**: System MUST calculer les indicateurs annuels par hectare : valeur_système / nbYears
- **FR-024**: System MUST recalculer les indicateurs système après toute modification affectant les totaux d'étape

### Functional Requirements - Persistance

- **FR-025**: System MUST sauvegarder toutes les valeurs calculées dans systemData.json au moment du calcul
- **FR-026**: System MUST persister les statuts (status, reviewed, confidence) avec chaque valeur
- **FR-027**: System MUST appeler `calculateAndSaveStepTotals()` via l'API PATCH après toute modification
- **FR-028**: System MUST recharger les données depuis l'API après sauvegarde pour obtenir les totaux recalculés

### Key Entities

- **Intervention**: Représente une opération agricole avec ses valeurs d'indicateurs dans `values[]`, chaque valeur ayant : key, value, status, reviewed, confidence, conversation
- **Step (Étape)**: Représente une phase de la rotation avec un tableau `values[]` contenant les totaux calculés et valeurs spécifiques à l'étape
- **System**: Représente le système complet avec des indicateurs consolidés calculés depuis les steps

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: L'utilisateur peut identifier visuellement le statut de toute cellule en moins de 2 secondes (via code couleur)
- **SC-002**: Après modification d'une cellule, tous les recalculs dépendants sont effectués en moins de 500ms
- **SC-003**: Les totaux d'étape reflètent correctement la pondération par fréquence dans 100% des cas
- **SC-004**: L'utilisateur peut forcer totalProduits et la valeur reste stable même si les composants changent
- **SC-005**: Les indicateurs système consolidés sont toujours synchronisés avec les données des étapes (pas de divergence)
- **SC-006**: 100% des valeurs calculées sont persistées dans le JSON au moment du calcul (pas de recalcul à chaque affichage)

## Assumptions

- Les utilisateurs comprennent le concept de pondération par fréquence
- Les valeurs numériques saisies sont valides (validation côté formulaire)
- Le package `calculateAndSaveStepTotals` est toujours appelé lors des mises à jour API
- Les performances de calcul sont acceptables même avec 50+ interventions par étape

## Dependencies

- `calculateAndSaveStepTotals()` : fonction existante qui calcule les totaux d'étape
- `SystemIndicators.tsx` : composant qui affiche les indicateurs consolidés
- `InterventionsDataTable.tsx` : table principale affichant interventions et étapes
- API PATCH `/api/systems/[id]` : point d'entrée pour sauvegarder les modifications

## Out of Scope

- Validation de cohérence inter-étapes (ex: vérifier que les dates ne se chevauchent pas)
- Export des données vers Excel/CSV
- Historique complet des modifications (seule la conversation par cellule est gardée)
- Mode multi-utilisateurs avec gestion des conflits
- Annulation/Rétablissement (undo/redo)

## Clarifications

### Session 2026-01-16

- Q: Comment le système gère-t-il une fréquence de 0 ou négative ? → A: fréquence=0 exclut l'intervention des totaux (contribution nulle), fréquences décimales 0<f<1 acceptées (ex: 0.5 = une année sur deux)
- Q: Que se passe-t-il si rendementTMS ou prixVente sont à zéro lors du calcul de totalProduits ? → A: calcul normal (0 × n = 0), résultat zéro est valide, utilisateur peut forcer via status='user' si nécessaire
- Q: Comment distinguer visuellement une cellule calculée d'une cellule validée (toutes deux sur fond blanc) ? → A: pas de distinction visuelle nécessaire, les deux sont considérées comme valeurs finales
- Q: Que se passe-t-il si step.values est manquant ou vide pour une étape ? → A: traiter comme zéro (contribution nulle de cette étape aux indicateurs système)
- Q: Que se passe-t-il si l'utilisateur saisit une valeur non numérique dans une cellule ? → A: validation HTML5 avec input type="number" empêche la saisie de caractères non numériques

