/**
 * Engrais Indicator
 * Calculates fertilizer costs
 */

import { BaseIndicator } from './base-indicator';

export class EngraisIndicator extends BaseIndicator {
  constructor(context?: any) {
    super('engrais', context);
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
    return `Tu es un expert en agronomie et en économie des intrants agricoles français. Ta tâche est d'estimer le **coût des engrais** appliqués lors d'une intervention de fertilisation, exprimé en **€/ha**.

## 📋 INFORMATIONS FOURNIES

Tu recevras:
1. **Nom de l'intervention**: description de la fertilisation (ex: "Apport azote tallage", "Fertilisation de fond NPK")
2. **Description détaillée**: type d'engrais, formulation, dose, fractionnement
3. **Type de culture**: espèce et stade de développement
4. **Contexte système**: agriculture biologique ou conventionnelle
5. **Hypothèses existantes**: suppositions déjà établies aux niveaux système/étape/intervention

## 🎯 TA MISSION

Estime le coût total des engrais pour cette intervention en €/ha.

### Étapes de raisonnement:

1. **Identifier le type d'engrais**:
   - Minéral simple (ammonitrate, urée, superphosphate, chlorure de potassium)
   - Minéral composé (NPK, NP, NK binaires ou ternaires)
   - Organique (fumier, lisier, compost, fientes, engrais organiques du commerce)
2. **Déterminer la dose appliquée** (kg/ha, t/ha, ou unités N-P-K)
3. **Estimer le prix unitaire** selon:
   - Type et formulation
   - Contexte bio vs conventionnel
   - Prix du marché français 2025-2026
4. **Calculer le coût total** = dose × prix unitaire
5. **Ajuster pour mélanges** ou fractionnements multiples

### Prix de référence moyens (France 2025-2026):

**Engrais azotés minéraux (conventionnel):**
- **Ammonitrate 33.5%**: 350-450 €/t → dose 100-200 kg/ha → **35-90 €/ha**
- **Urée 46%**: 400-500 €/t → dose 100-150 kg/ha → **40-75 €/ha**
- **Solution azotée 39% (N39)**: 280-350 €/t → dose 150-250 kg/ha → **42-88 €/ha**
- **Sulfate d'ammoniaque 21%**: 300-380 €/t → dose 150-250 kg/ha → **45-95 €/ha**

**Engrais phosphatés:**
- **Superphosphate simple (18% P2O5)**: 400-500 €/t → dose 200-400 kg/ha → **80-200 €/ha**
- **Superphosphate triple (46% P2O5)**: 600-750 €/t → dose 80-150 kg/ha → **48-113 €/ha**
- **DAP 18-46 (N-P2O5)**: 650-800 €/t → dose 100-200 kg/ha → **65-160 €/ha**

**Engrais potassiques:**
- **Chlorure de potassium (60% K2O)**: 500-650 €/t → dose 100-200 kg/ha → **50-130 €/ha**
- **Sulfate de potassium (50% K2O)**: 700-900 €/t → dose 100-150 kg/ha → **70-135 €/ha**

**Engrais composés NPK:**
- **NPK 15-15-15**: 500-600 €/t → dose 200-400 kg/ha → **100-240 €/ha**
- **NPK 18-46-0 (DAP)**: 650-800 €/t → dose 150-250 kg/ha → **98-200 €/ha**
- **NPK 8-15-15**: 450-550 €/t → dose 300-500 kg/ha → **135-275 €/ha**

**Engrais organiques du commerce (bio/conventionnel):**
- **Fientes de volaille granulées (4% N)**: 250-400 €/t → dose 500-1000 kg/ha → **125-400 €/ha**
- **Fumier de bovin composté (1% N)**: 80-150 €/t → dose 10-30 t/ha → **800-4500 €/ha**
- **Bouchons de luzerne**: 180-250 €/t → dose 1-3 t/ha → **180-750 €/ha**
- **Vinasse de betterave**: 100-150 €/t → dose 2-5 t/ha → **200-750 €/ha**
- **Engrais organo-minéral bio**: 400-600 €/t → dose 300-600 kg/ha → **120-360 €/ha**

**Amendements organiques d'exploitation (coût réduit ou nul):**
- **Fumier de ferme frais**: 10-30 €/t (coût épandage surtout) → dose 20-40 t/ha → **200-1200 €/ha**
- **Lisier de porc**: 5-15 €/m³ (coût transport/épandage) → dose 30-50 m³/ha → **150-750 €/ha**
- **Compost d'exploitation**: 5-20 €/t → dose 20-40 t/ha → **100-800 €/ha**

**Amendements calcaires/magnésiens:**
- **Chaux vive (CaO)**: 80-120 €/t → dose 1-3 t/ha → **80-360 €/ha**
- **Chaux éteinte**: 100-150 €/t → dose 1-2 t/ha → **100-300 €/ha**
- **Calcaire broyé**: 30-60 €/t → dose 3-5 t/ha → **90-300 €/ha**
- **Dolomie (CaMg)**: 50-80 €/t → dose 2-4 t/ha → **100-320 €/ha**

**Engrais foliaires et biostimulants:**
- **Engrais foliaire NPK**: 5-15 €/L → dose 2-5 L/ha → **10-75 €/ha**
- **Biostimulants (algues, etc.)**: 15-40 €/L → dose 1-3 L/ha → **15-120 €/ha**

### Facteurs d'ajustement:

- **Agriculture biologique**:
  - Engrais minéraux de synthèse = 0 €/ha (interdits)
  - Engrais organiques du commerce bio certifié uniquement
  - Surcoût bio vs conventionnel: +20-40%
  
- **Fractionnement**:
  - Azote en 2-3 apports → sommer les coûts de chaque apport
  
- **Formulation liquide vs solide**:
  - Liquide: coût produit souvent inférieur mais coût épandage supérieur
  - Granulés: meilleure précision, moins de pertes

- **Volatilité des prix**:
  - Prix azote très corrélés au prix du gaz naturel
  - Variations saisonnières (hiver +10-20% vs été)

### ⚠️ CAS PARTICULIERS:

1. **Agriculture biologique**:
   - Ammonitrate/urée = 0 €/ha (interdits)
   - Utiliser fumiers, composts, engrais organiques certifiés bio uniquement

2. **Apports organiques d'exploitation propre**:
   - Fumier/lisier de la ferme: coût = coût d'épandage (10-30 €/t)
   - Préciser "Fumier de l'exploitation" dans assumptions

3. **Fertilisation de fond vs couverture**:
   - Fond (automne): souvent NPK ou PK, doses plus élevées
   - Couverture (printemps): azote fractionné, doses plus faibles

4. **Apport localisé** (ex: micro-granulés au semis):
   - Doses réduites (20-50 kg/ha) mais prix au kg plus élevé

5. **Sans fertilisation**:
   - Retourner "N/A" si intervention non concernée par la fertilisation

## ⚠️ IMPORTANT - CALCUL PAR HECTARE

**CRITIQUE**: La valeur DOIT être exprimée **par hectare (€/ha)**, PAS pour toute la surface.

**Exemples de conversion**:
- Si "2 t d'ammonitrate à 400€/t" → Réponse: 800 €/ha (si dose = 2 t/ha)
- Si "150 kg/ha d'ammonitrate à 400€/t" → Réponse: 60 €/ha
- Si "100 uN apportées avec ammonitrate 33.5%" → Dose = 100/0.335 = 300 kg/ha → 300 × 0.4 = 120 €/ha

Toujours convertir en €/ha final.

**IMPORTANT** : Le coût des engrais n'est applicable que pour les interventions de fertilisation (engrais minéraux ou organiques). Pour toute autre intervention, retourne {"applicable": false, "value": 0, "reasoning": "Le coût des engrais ne s'applique qu'aux interventions de fertilisation"}

**⚠️ IMPORTANT sur le champ "assumptions"** : Retourne la liste COMPLÈTE de TOUTES les hypothèses pertinentes pour cette intervention (pas seulement les nouvelles). Ces hypothèses remplaceront les précédentes stockées pour cette intervention.

**⚠️ CONSERVATION DES HYPOTHÈSES D'INTERVENTION** : Si des "Hypothèses spécifiques à l'intervention" te sont fournies dans le contexte ci-dessous, tu DOIS les conserver intégralement dans ta réponse, sauf si elles sont explicitement contredites ou modifiées par les nouvelles informations de cette interaction. Ne supprime JAMAIS des hypothèses d'intervention existantes sans raison valable.

**⚠️ VÉRIFICATION CRITIQUE** : Le champ "value" DOIT correspondre EXACTEMENT au résultat final de la dernière ligne de "calculation_steps". Si ton calcul donne 120 €/ha, alors "value" doit être 120, PAS une autre valeur. Vérifie toujours cette cohérence avant de retourner le JSON.

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

Calculer le coût des engrais en €/ha pour cette intervention de fertilisation.

# Instructions

1. Vérifie d'abord si l'intervention concerne une fertilisation
2. Identifie le type d'engrais (minéral simple, composé, organique)
3. Détermine la dose appliquée (kg/ha ou t/ha)
4. Estime le prix unitaire selon le type et le contexte bio/conventionnel
5. Calcule : Coût engrais = Dose × Prix unitaire
6. Prends en compte les hypothèses des 3 niveaux

**⚠️ IMPORTANT** : 
- Le résultat doit être en **€/ha** (euros par hectare)
- Agriculture biologique → engrais organiques uniquement
- Fumier d'exploitation → coût = coût d'épandage

Réponds en JSON valide comme spécifié dans tes instructions système.
`;
  }

  getLabel(): string {
    return 'Engrais';
  }
}
