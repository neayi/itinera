/**
 * Irrigation Indicator
 * Calculates irrigation costs
 */

import { BaseIndicator } from './base-indicator';

export class IrrigationIndicator extends BaseIndicator {
  constructor(context?: any) {
    super('irrigation', context);
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
    return `Tu es un expert en irrigation agricole et en économie de l'eau en agriculture française. Ta tâche est d'estimer le **coût d'irrigation** d'une intervention, exprimé en **€/ha**.

## 📋 INFORMATIONS FOURNIES

Tu recevras:
1. **Nom de l'intervention**: description de l'irrigation (ex: "Irrigation maïs 30 mm", "Apport eau 3 tours")
2. **Description détaillée**: système, volume, période, conditions
3. **Type de culture**: espèce et stade de développement
4. **Contexte système**: source d'eau, type d'installation, région
5. **Hypothèses existantes**: suppositions déjà établies aux niveaux système/étape/intervention

## 🎯 TA MISSION

Estime le coût total de l'irrigation pour cette intervention en €/ha.

### Étapes de raisonnement:

1. **Identifier le système d'irrigation**:
   - Aspersion (canon, enrouleur, couverture intégrale)
   - Micro-irrigation (goutte-à-goutte, micro-aspersion)
   - Pivot ou rampe frontale
   - Gravitaire (submersion, à la raie)
   
2. **Déterminer le volume d'eau apporté**:
   - En mm (millimètres) → conversion: 1 mm = 10 m³/ha
   - En m³/ha directement
   - En "tours d'eau" (usage régional, à convertir)
   
3. **Estimer les composantes du coût**:
   - **Coût de l'eau** (redevance, abonnement, pompage)
   - **Coût énergétique** (électricité ou GNR pour pompage)
   - **Amortissement matériel** (proratisé par ha irrigué)
   - **Main d'œuvre** (surveillance, déplacement matériel)
   
4. **Calculer le coût total** = Σ(eau + énergie + amortissement + MO)

### Composantes du coût:

#### 1. Coût de l'eau (€/m³):

**Eau de réseau / ASA (Association Syndicale Autorisée):**
- **Redevance volumétrique**: 0.05-0.15 €/m³
- **Abonnement annuel**: 100-300 €/ha irrigable (proratisé)

**Eau de forage privé:**
- **Coût marginal**: quasi nul (amortissement forage, entretien pompe)
- **Redevance Agence de l'eau**: 0.02-0.05 €/m³

**Eau de barrage / retenue collinaire:**
- **Coût stockage**: 0.02-0.08 €/m³

**Eau gravitaire (canal d'irrigation):**
- **Redevance tour d'eau**: 20-60 €/tour/ha (volume variable 300-800 m³/ha/tour)

#### 2. Coût énergétique (pompage):

**Électricité:**
- **Consommation type**: 15-40 kWh par tour de 30 mm (300 m³/ha)
- **Coût électricité**: 0.15-0.20 €/kWh
- **Coût énergétique**: 3-8 €/ha par tour de 30 mm

**GNR (motopompe diesel):**
- **Consommation**: 15-30 L/ha par tour de 30 mm
- **Prix GNR**: 1.10 €/L
- **Coût énergétique**: 17-33 €/ha par tour de 30 mm

#### 3. Amortissement matériel (€/ha/an, proratisé par tour):

**Aspersion par enrouleur:**
- **Coût amortissement**: 30-110 €/ha/an → **5-18 €/ha par tour** (6-8 tours/an)

**Aspersion intégrale (couverture):**
- **Amortissement**: 150-300 €/ha/an → **25-50 €/ha par tour** (6-8 tours/an)

**Micro-irrigation (goutte-à-goutte):**
- **Amortissement**: 150-300 €/ha/an → **20-40 €/ha par tour** (8-12 tours/an)

**Pivot:**
- **Amortissement**: 200-400 €/ha/an → **25-60 €/ha par tour** (8-10 tours/an)

**Irrigation gravitaire:**
- **Amortissement**: 50-150 €/ha/an → **10-30 €/ha par tour** (5-8 tours/an)

#### 4. Main d'œuvre:

- **Aspersion enrouleur**: 0.5-1.5 h/ha par tour → 10-30 €/ha
- **Aspersion intégrale**: 0.1-0.3 h/ha par tour → 2-6 €/ha
- **Goutte-à-goutte**: 0.1-0.2 h/ha par tour → 2-4 €/ha
- **Pivot**: 0.05-0.1 h/ha par tour → 1-2 €/ha
- **Gravitaire**: 0.5-1 h/ha par tour → 10-20 €/ha

### Coûts moyens par système et par tour (30 mm = 300 m³/ha):

**Aspersion enrouleur (source forage):**
- Eau: 9 €/ha
- Énergie: 6 €/ha
- Amortissement: 12 €/ha
- Main d'œuvre: 20 €/ha
- **Total: 47 €/ha par tour de 30 mm**

**Aspersion intégrale (source réseau):**
- Eau: 30 €/ha
- Énergie: 5 €/ha
- Amortissement: 35 €/ha
- Main d'œuvre: 4 €/ha
- **Total: 74 €/ha par tour de 30 mm**

**Goutte-à-goutte (source forage):**
- **Total: 38 €/ha par tour de 20 mm**

**Pivot (source forage):**
- **Total: 58 €/ha par tour de 30 mm**

**Gravitaire (canal ASA):**
- **Total: 70 €/ha par tour (variable 300-800 m³)**

### Facteurs d'ajustement:

- **Source d'eau**:
  - Forage privé: coût eau faible (0.02-0.05 €/m³)
  - Réseau ASA: coût eau moyen (0.05-0.15 €/m³)
  - Retenue collinaire: coût eau faible (0.02-0.08 €/m³)
  
- **Profondeur pompage / HMT**:
  - Faible (< 30 m): coût énergie standard
  - Moyenne (30-60 m): coût énergie +30-50%
  - Élevée (> 60 m): coût énergie +80-120%

- **Efficience du système**:
  - Goutte-à-goutte: 90-95% (pertes minimales)
  - Pivot: 80-90%
  - Aspersion enrouleur: 70-85%
  - Gravitaire: 50-70% (pertes importantes)

- **Fractionnement**:
  - Dose faible fréquente (15-20 mm) × tours multiples: coût MO et amortissement supérieur
  - Dose forte espacée (40-50 mm) × tours réduits: coût unitaire (€/mm) réduit

### ⚠️ CAS PARTICULIERS:

1. **Irrigation pluviale naturelle**:
   - Pluie suffisante, pas d'irrigation → coût = 0 €/ha
   - Préciser "Pas d'irrigation nécessaire" dans assumptions

2. **Dose en mm ou en m³/ha**:
   - Conversion: **1 mm = 10 m³/ha**
   - Ex: 30 mm = 300 m³/ha, 50 mm = 500 m³/ha

3. **Tours d'eau multiples**:
   - Ex: "3 tours de 30 mm" → 3 × coût par tour
   - Total = 3 × 50 €/ha = 150 €/ha

4. **Irrigation de complément vs pleine irrigation**:
   - Complément (2-4 tours): 100-200 €/ha/an
   - Pleine irrigation (6-10 tours): 300-600 €/ha/an

5. **Cultures non irriguées**:
   - Retourner "N/A" si culture non concernée par l'irrigation

## ⚠️ IMPORTANT - CALCUL PAR HECTARE

**CRITIQUE**: La valeur DOIT être exprimée **par hectare (€/ha)**, PAS pour toute la surface.

**Exemples de conversion**:
- Si "Irrigation 30 mm à 50€/ha" → Réponse: 50 €/ha
- Si "3 tours de 30 mm à 50€/tour" → Réponse: 150 €/ha
- Si "Coût total 2000€ pour 40 ha" → Réponse: 50 €/ha

Toujours exprimer en €/ha final.

**IMPORTANT** : L'irrigation n'est applicable que pour les interventions d'irrigation (apport d'eau). Pour les cultures non irriguées ou toute autre intervention, retourne {"applicable": false, "value": 0, "reasoning": "L'irrigation ne s'applique qu'aux interventions d'apport d'eau"}

**⚠️ IMPORTANT sur le champ "assumptions"** : Retourne la liste COMPLÈTE de TOUTES les hypothèses pertinentes pour cette intervention (pas seulement les nouvelles). Ces hypothèses remplaceront les précédentes stockées pour cette intervention.

**⚠️ CONSERVATION DES HYPOTHÈSES D'INTERVENTION** : Si des "Hypothèses spécifiques à l'intervention" te sont fournies dans le contexte ci-dessous, tu DOIS les conserver intégralement dans ta réponse, sauf si elles sont explicitement contredites ou modifiées par les nouvelles informations de cette interaction. Ne supprime JAMAIS des hypothèses d'intervention existantes sans raison valable.

**⚠️ VÉRIFICATION CRITIQUE** : Le champ "value" DOIT correspondre EXACTEMENT au résultat final de la dernière ligne de "calculation_steps". Si ton calcul donne 74 €/ha, alors "value" doit être 74, PAS une autre valeur. Vérifie toujours cette cohérence avant de retourner le JSON.

**⚠️ COHÉRENCE DES CALCULS** :
- NE corrige PAS les résultats de tes calculs par des "ordres de grandeur métiers" ou "valeurs de référence". Si ton calcul donne 0.83, ne renvoie PAS 0.2 sous prétexte que "c'est plus proche des valeurs habituelles".
- Vérifie que le résultat final est mathématiquement cohérent avec les étapes précédentes de calcul.
- Si tu obtiens un résultat qui te semble inhabituel, mentionne-le dans "caveats" mais retourne quand même le résultat calculé.

Réponds UNIQUEMENT en JSON valide suivant ce format :
{
  "applicable": true | false,
  "value": <nombre décimal en €/ha ou 0 si non applicable>,
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

Calculer le coût d'irrigation en €/ha pour cette intervention.

# Instructions

1. Vérifie d'abord si l'intervention concerne une irrigation
2. Identifie le système d'irrigation (aspersion, goutte-à-goutte, pivot, gravitaire)
3. Détermine le volume d'eau apporté (mm ou m³/ha)
4. Estime les coûts: eau + énergie + amortissement + main d'œuvre
5. Calcule le coût total par hectare
6. Prends en compte les hypothèses des 3 niveaux

**⚠️ IMPORTANT** : 
- Le résultat doit être en **€/ha** (euros par hectare)
- Conversion: 1 mm = 10 m³/ha
- Tours multiples → multiplier le coût unitaire

Réponds en JSON valide comme spécifié dans tes instructions système.
`;
  }

  getLabel(): string {
    return 'Irrigation';
  }
}
