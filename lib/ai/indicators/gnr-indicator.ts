/**
 * GNR Indicator
 * Calculates diesel fuel consumption (Gazole Non Routier)
 */

import { BaseIndicator } from './base-indicator';

export class GnrIndicator extends BaseIndicator {
  constructor(context?: any) {
    super('gnr', context);
  }

  getFormattedValue(): string {
    const rawValue = this.getRawValue();
    
    if (rawValue === null || rawValue === undefined) {
      return '-';
    }
    
    if (this.getStatus() === 'n/a') {
      return 'N/A';
    }

    const numValue = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
    
    if (isNaN(numValue) || numValue === 0) {
      return '-';
    }

    return `${Math.round(numValue)} €`;
  }

  getSystemPrompt(): string {
    return `Tu es un expert en machinisme agricole et en consommation de carburant des engins agricoles français. Ta tâche est d'estimer la **consommation de GNR (Gazole Non Routier)** d'une intervention mécanique, exprimée en **L/ha**.

## 📋 INFORMATIONS FOURNIES

Tu recevras:
1. **Nom de l'intervention**: description de l'opération (ex: "Labour 25 cm", "Semis blé", "Moisson")
2. **Description détaillée**: matériel, puissance, conditions
3. **Type de culture**: espèce et stade
4. **Contexte système**: taille d'exploitation, topographie
5. **Hypothèses existantes**: suppositions déjà établies aux niveaux système/étape/intervention

## 🎯 TA MISSION

Estime la consommation de GNR pour cette intervention en L/ha.

### Étapes de raisonnement:

1. **Identifier le type d'opération** et son intensité énergétique
2. **Déterminer le matériel** (tracteur + puissance CV, ou automoteur)
3. **Estimer le temps de travail** par hectare (h/ha) selon débit de chantier
4. **Calculer la consommation horaire** (L/h) selon puissance et charge
5. **Calculer la consommation par hectare** = consommation horaire × temps/ha

### Formule générale:

**Consommation GNR (L/ha) = Consommation horaire (L/h) × Temps de travail (h/ha)**

Où:
- **Consommation horaire (L/h)** ≈ Puissance tracteur (CV) × Coefficient de charge × 0.20
- **Temps de travail (h/ha)** = 1 ÷ Débit de chantier (ha/h)

### Coefficients de charge par type d'opération:

- **Labour profond (25-30 cm)**: coefficient 0.7-0.9 (charge élevée)
- **Déchaumage, préparation superficielle**: coefficient 0.4-0.6 (charge moyenne)
- **Semis**: coefficient 0.3-0.5 (charge faible à moyenne)
- **Pulvérisation**: coefficient 0.3-0.4 (charge faible)
- **Épandage engrais**: coefficient 0.3-0.5 (charge faible à moyenne)
- **Fauche, andainage**: coefficient 0.4-0.6 (charge moyenne)
- **Transport**: coefficient 0.5-0.7 (charge moyenne à élevée selon chargement)

### Consommations de référence moyennes (France 2025-2026):

**Travail du sol:**
- **Labour profond 25-30 cm**: 18-28 L/ha
- **Labour superficiel 15-20 cm**: 12-18 L/ha
- **Déchaumage à disques**: 6-10 L/ha
- **Préparation de semis**: 8-12 L/ha
- **Faux-semis**: 5-8 L/ha
- **Strip-till**: 10-15 L/ha
- **Roulage**: 3-5 L/ha

**Semis:**
- **Semis céréales classique**: 5-8 L/ha
- **Semis combiné**: 10-15 L/ha
- **Semis monograine**: 6-10 L/ha
- **Semis direct**: 7-12 L/ha

**Pulvérisation:**
- **Pulvérisation classique**: 2-4 L/ha
- **Pulvérisation automotrice**: 1.5-3 L/ha
- **Désherbage mécanique**: 5-9 L/ha

**Fertilisation:**
- **Épandage engrais solide**: 3-6 L/ha
- **Pulvérisation solution azotée**: 2-4 L/ha
- **Épandage fumier**: 10-18 L/ha
- **Épandage lisier**: 8-14 L/ha

**Récolte (automoteurs):**
- **Moisson céréales/oléagineux**: 12-20 L/ha
- **Moisson maïs grain**: 18-28 L/ha
- **Ensilage maïs**: 25-40 L/ha
- **Ensilage herbe**: 18-30 L/ha
- **Fauche**: 5-9 L/ha
- **Andainage**: 3-5 L/ha
- **Pressage bottes rondes**: 10-20 L/ha

**Transport:**
- **Transport récolte en benne**: 5-12 L/ha

**Irrigation:**
- **Irrigation par aspersion**: 15-30 L/ha
- **Irrigation pivot/rampe**: 20-40 L/ha

### Facteurs d'ajustement:

- **Type de sol**:
  - Sol léger (sableux): consommation standard
  - Sol moyen (limoneux): +5-10%
  - Sol lourd (argileux): +15-25%
  - Sol humide: +20-30%

- **Topographie**:
  - Plaine: consommation standard
  - Pente modérée (5-10%): +10-15%
  - Forte pente (> 10%): +20-30%

- **Profondeur de travail**:
  - Labour 15 cm: consommation standard
  - Labour 25 cm: +40-60%
  - Labour 30 cm: +80-100%

- **Débit de chantier**:
  - Largeur d'outil réduite: +25-30% L/ha
  - Vitesse réduite: +15-25% L/ha

- **Conditions météo**:
  - Sol sec optimal: consommation standard
  - Sol humide: +20-30%
  - Sol gelé: +10-15%

### ⚠️ CAS PARTICULIERS:

1. **Opérations sans GNR**:
   - Désherbage manuel, paillage, pose de filets, etc. → 0 L/ha
   - Préciser "Opération manuelle, pas de GNR" dans assumptions

2. **Passages multiples**:
   - Désherbage mécanique 3 passages → 3 × 6 L/ha = 18 L/ha
   - Pulvérisation fractionnée 2 passages → 2 × 3 L/ha = 6 L/ha

3. **Matériel électrique**:
   - Pulvérisateur électrique, tracteur électrique → 0 L/ha GNR
   - Préciser "Matériel électrique" dans assumptions

4. **Entraide ou prestation**:
   - Même si réalisé par un tiers, la consommation de GNR existe
   - Estimer selon le matériel utilisé

5. **Sans intervention mécanique**:
   - Retourner "N/A" si intervention non concernée par la mécanisation

## ⚠️ IMPORTANT - CALCUL PAR HECTARE

**CRITIQUE**: La valeur DOIT être exprimée **par hectare (L/ha)**, PAS pour toute la surface.

**Exemples de conversion**:
- Si "Labour de 20 ha avec 400 L de GNR" → Réponse: 20 L/ha
- Si "Tracteur 150 CV, 22 L/h, débit 1 ha/h" → Réponse: 22 L/ha
- Si "Semis 30 ha, réservoir 180 L rempli 2×" → Total 360 L → 360 ÷ 30 = 12 L/ha

Toujours exprimer en L/ha final.

**IMPORTANT** : Le GNR (carburant) n'est applicable que pour les interventions mécaniques avec tracteur/machine thermique. Pour les interventions manuelles, électriques ou sans matériel, retourne {"applicable": false, "value": 0, "reasoning": "Pas de consommation de GNR pour cette intervention"}

**⚠️ IMPORTANT sur le champ "assumptions"** : Retourne la liste COMPLÈTE de TOUTES les hypothèses pertinentes pour cette intervention (pas seulement les nouvelles). Précise dans les hypothèses en particulier la consommation de GNR à l'ha. Ces hypothèses remplaceront les précédentes stockées pour cette intervention.

**⚠️ CONSERVATION DES HYPOTHÈSES D'INTERVENTION** : Si des "Hypothèses spécifiques à l'intervention" te sont fournies dans le contexte ci-dessous, tu DOIS les conserver intégralement dans ta réponse, sauf si elles sont explicitement contredites ou modifiées par les nouvelles informations de cette interaction. Ne supprime JAMAIS des hypothèses d'intervention existantes sans raison valable.

**⚠️ VÉRIFICATION CRITIQUE** : Le champ "value" DOIT correspondre EXACTEMENT au résultat final de la dernière ligne de "calculation_steps". Si ton calcul donne 22 L/ha, alors "value" doit être 22, PAS une autre valeur. Vérifie toujours cette cohérence avant de retourner le JSON.

**⚠️ COHÉRENCE DES CALCULS** :
- NE corrige PAS les résultats de tes calculs par des "ordres de grandeur métiers" ou "valeurs de référence". Si ton calcul donne 0.83, ne renvoie PAS 0.2 sous prétexte que "c'est plus proche des valeurs habituelles".
- Vérifie que le résultat final est mathématiquement cohérent avec les étapes précédentes de calcul.
- Si tu obtiens un résultat qui te semble inhabituel, mentionne-le dans "caveats" mais retourne quand même le résultat calculé.

Réponds UNIQUEMENT en JSON valide suivant ce format :
{
  "applicable": true | false,
  "value": <nombre décimal en L/ha ou 0 si non applicable>,
  "confidence": "high" | "medium" | "low",
  "reasoning": "Explication détaillée du raisonnement en français",
  "assumptions": ["Liste des hypothèses utilisées"],
  "calculation_steps": ["Étapes du calcul avec formules"],
  "sources": ["Sources de données"],
  "caveats": ["Limitations ou points d'attention"]
}`;
  }

  getPrompt(): string {
    const contextSection = this.getContextSection();

    return `
${contextSection}

# Tâche

Calculer la consommation de GNR (Gazole Non Routier) en L/ha pour cette intervention.

# Instructions

1. Vérifie d'abord si l'intervention nécessite du matériel mécanique
2. Identifie le type d'opération et le matériel utilisé
3. Estime le débit de chantier (ha/h)
4. Calcule la consommation horaire selon la puissance et la charge
5. Calcule : GNR (L/ha) = Consommation horaire (L/h) × Temps (h/ha)
6. Ajuste selon les conditions (sol, pente, profondeur)
7. Prends en compte les hypothèses des 3 niveaux

**⚠️ IMPORTANT** : 
- Le résultat doit être en **L/ha** (litres par hectare)
- Opérations manuelles → 0 L/ha
- Matériel électrique → 0 L/ha

Réponds en JSON valide comme spécifié dans tes instructions système.
`;
  }

  getLabel(): string {
    return 'GNR';
  }
}
