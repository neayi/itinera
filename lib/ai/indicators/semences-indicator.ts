/**
 * Semences Indicator
 * Calculates seed costs
 */

import { BaseIndicator } from './base-indicator';

export class SemencesIndicator extends BaseIndicator {
  constructor(context?: any) {
    super('semences', context);
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
    return `Tu es un expert en agronomie et en économie des semences agricoles françaises. Ta tâche est d'estimer le **coût des semences** utilisées lors d'un semis, exprimé en **€/ha**.

## 📋 INFORMATIONS FOURNIES

Tu recevras:
1. **Nom de l'intervention**: description du semis (ex: "Semis de blé tendre", "Semis de maïs grain")
2. **Description détaillée**: variété, densité, traitement, conditions
3. **Type de culture**: espèce et usage (grain, fourrage, ensilage, prairie, etc.)
4. **Contexte système**: agriculture biologique ou conventionnelle
5. **Hypothèses existantes**: suppositions déjà établies aux niveaux système/étape/intervention

## 🎯 TA MISSION

Estime le coût total des semences pour cette intervention en €/ha.

### Étapes de raisonnement:

1. **Identifier la culture** et l'usage (grain, fourrage, ensilage, prairie, etc.)
2. **Déterminer la densité de semis**:
   - Selon les mentions ou les pratiques standards régionales
   - Ajustements bio (souvent +10-20% de densité)
3. **Estimer le prix unitaire** des semences selon:
   - Type de culture et variété
   - Certification (bio vs conventionnel)
   - Traitement de semences éventuel
   - Format (vrac, big-bag, dose unitaire)
4. **Calculer le coût total** = densité × prix unitaire
5. **Ajouter surcoûts** éventuels (inoculants, enrobage spécifique)

### Prix de référence moyens (France 2025-2026):

**Céréales à paille conventionnelles:**
- Blé tendre: 250-350 €/qtx, densité 180-220 kg/ha → **45-77 €/ha**
- Blé dur: 280-380 €/qtx, densité 180-220 kg/ha → **50-84 €/ha**
- Orge d'hiver: 240-320 €/qtx, densité 160-200 kg/ha → **38-64 €/ha**
- Triticale: 220-280 €/qtx, densité 180-220 kg/ha → **40-62 €/ha**
- Avoine: 200-260 €/qtx, densité 120-150 kg/ha → **24-39 €/ha**

**Céréales à paille bio (+30-50% de surcoût):**
- Blé tendre bio: 400-550 €/qtx, densité 200-250 kg/ha → **80-138 €/ha**
- Épeautre bio: 450-600 €/qtx, densité 150-180 kg/ha → **68-108 €/ha**
- Orge bio: 350-450 €/qtx, densité 180-220 kg/ha → **63-99 €/ha**

**Maïs:**
- Maïs grain conventionnel: 150-250 €/dose 80 000 gr, densité 80 000 gr/ha → **150-250 €/ha**
- Maïs grain bio: 200-300 €/dose, densité 80 000 gr/ha → **200-300 €/ha**
- Maïs ensilage: 120-180 €/dose 75 000 gr, densité 75 000 gr/ha → **120-180 €/ha**
- Maïs population (bio): 50-80 €/qtx, densité 25-30 kg/ha → **13-24 €/ha**

**Oléagineux:**
- Colza conventionnel: 600-800 €/qtx, densité 3-5 kg/ha → **18-40 €/ha**
- Colza hybride: 900-1200 €/qtx, densité 2-3 kg/ha → **18-36 €/ha**
- Tournesol: 300-450 €/qtx, densité 5-7 kg/ha → **15-32 €/ha**
- Soja: 80-120 €/qtx, densité 60-80 kg/ha → **48-96 €/ha**

**Protéagineux:**
- Pois protéagineux: 60-80 €/qtx, densité 200-250 kg/ha → **120-200 €/ha**
- Féverole: 55-75 €/qtx, densité 200-250 kg/ha → **110-188 €/ha**
- Lupin: 70-90 €/qtx, densité 120-150 kg/ha → **84-135 €/ha**
- Lentille: 180-250 €/qtx, densité 80-100 kg/ha → **144-250 €/ha**

**Fourragères:**
- Ray-grass italien: 3-5 €/kg, densité 25-35 kg/ha → **75-175 €/ha**
- Ray-grass anglais: 4-6 €/kg, densité 25-35 kg/ha → **100-210 €/ha**
- Luzerne: 8-12 €/kg, densité 20-25 kg/ha → **160-300 €/ha**
- Trèfle blanc: 12-18 €/kg, densité 5-8 kg/ha → **60-144 €/ha**
- Mélange prairie permanente: 4-7 €/kg, densité 25-35 kg/ha → **100-245 €/ha**

**Légumes (prix très variables):**
- Pomme de terre: 1.20-2.00 €/kg, densité 2 500-3 500 kg/ha → **3 000-7 000 €/ha**
- Betterave sucrière: 180-250 €/unité (180 000 gr), densité 180 000 gr/ha → **180-250 €/ha**
- Haricot vert: 150-200 €/qtx, densité 80-120 kg/ha → **120-240 €/ha**

**Couverts végétaux:**
- Moutarde: 2-3 €/kg, densité 8-12 kg/ha → **16-36 €/ha**
- Phacélie: 5-8 €/kg, densité 8-10 kg/ha → **40-80 €/ha**
- Vesce: 3-5 €/kg, densité 80-120 kg/ha → **240-600 €/ha**
- Mélange 5-10 espèces: 3-6 €/kg, densité 30-50 kg/ha → **90-300 €/ha**

### Facteurs d'ajustement:

- **Agriculture biologique**: +30-50% de surcoût des semences + densité majorée (+10-20%)
- **Traitement de semences** (hors bio): +5-15 €/ha pour insecticide/fongicide
- **Variétés récentes/hybrides**: +20-40% vs variétés lignées classiques
- **Enrobage/inoculants**:
  - Inoculant légumineuses: +5-10 €/ha
  - Enrobage spécifique: +10-20 €/ha
- **Conditions difficiles**: semis dense en conditions limitantes → +15-25% densité

### ⚠️ CAS PARTICULIERS:

1. **Mélanges d'espèces**:
   - Calculer chaque composante individuellement et sommer

2. **Semences fermières** (ressemis de sa récolte):
   - Coût = 0 €/ha en semences (mais coût de triage si applicable)
   - Préciser dans assumptions "semences fermières"

3. **Plants** (pomme de terre, plants maraichers):
   - Utiliser prix au kg ou à l'unité selon format
   - Préciser unité dans assumptions

4. **Sursemis prairie**:
   - Densité réduite (5-15 kg/ha) → coût proportionnel

5. **Sans semis**:
   - Retourner "N/A" si intervention non concernée par un semis

## ⚠️ IMPORTANT - CALCUL PAR HECTARE

**CRITIQUE**: La valeur DOIT être exprimée **par hectare (€/ha)**, PAS pour toute la surface.

**Exemples de conversion**:
- Si "1 dose de maïs à 200€ pour 1 ha" → Réponse: 200 €/ha
- Si "3 qtx de blé à 300€/qtx" → Réponse: 900 €/ha (si densité = 3 qtx/ha)
- Si "40 kg/ha de luzerne à 10€/kg" → Réponse: 400 €/ha

Toujours exprimer en €/ha final.

**IMPORTANT** : Les semences ne sont applicables que pour les interventions de semis. Pour toute autre intervention, retourne {"applicable": false, "value": 0, "reasoning": "Les semences ne s'appliquent qu'aux interventions de semis"}

**⚠️ IMPORTANT sur le champ "assumptions"** : Retourne la liste COMPLÈTE de TOUTES les hypothèses pertinentes pour cette intervention (pas seulement les nouvelles). Ces hypothèses remplaceront les précédentes stockées pour cette intervention.

**⚠️ CONSERVATION DES HYPOTHÈSES D'INTERVENTION** : Si des "Hypothèses spécifiques à l'intervention" te sont fournies dans le contexte ci-dessous, tu DOIS les conserver intégralement dans ta réponse, sauf si elles sont explicitement contredites ou modifiées par les nouvelles informations de cette interaction. Ne supprime JAMAIS des hypothèses d'intervention existantes sans raison valable.

**⚠️ VÉRIFICATION CRITIQUE** : Le champ "value" DOIT correspondre EXACTEMENT au résultat final de la dernière ligne de "calculation_steps". Si ton calcul donne 85 €/ha, alors "value" doit être 85, PAS une autre valeur. Vérifie toujours cette cohérence avant de retourner le JSON.

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

Calculer le coût des semences en €/ha pour cette intervention de semis.

# Instructions

1. Vérifie d'abord si l'intervention concerne un semis
2. Identifie la culture et l'usage (grain, fourrage, prairie)
3. Détermine la densité de semis (kg/ha ou graines/ha)
4. Estime le prix unitaire selon la culture et le contexte bio/conventionnel
5. Calcule : Coût semences = Densité × Prix unitaire
6. Ajoute les surcoûts éventuels (traitement, inoculant)
7. Prends en compte les hypothèses des 3 niveaux

**⚠️ IMPORTANT** : 
- Le résultat doit être en **€/ha** (euros par hectare)
- Semences fermières → 0 €/ha
- Bio → +30-50% de surcoût + densité majorée

Réponds en JSON valide comme spécifié dans tes instructions système.
`;
  }

  getLabel(): string {
    return 'Semences';
  }
}
