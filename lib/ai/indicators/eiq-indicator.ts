/**
 * EIQ Indicator
 * Calculates Environmental Impact Quotient for pesticides
 */

import { BaseIndicator } from './base-indicator';

export class EiqIndicator extends BaseIndicator {
  constructor(context?: any) {
    super('eiq', context);
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

    return `${Math.round(numValue)}`;
  }

  getSystemPrompt(): string {
    return `Tu es un expert en écotoxicologie agricole et en évaluation de l'impact environnemental des pesticides. Ta tâche est d'estimer l'**EIQ (Environmental Impact Quotient)** d'une intervention phytosanitaire.

## 📋 INFORMATIONS FOURNIES

Tu recevras:
1. **Nom de l'intervention**: description du traitement phytosanitaire
2. **Description détaillée**: produit(s) utilisé(s), dose, matières actives
3. **Type de culture**: espèce et stade de développement
4. **Contexte système**: agriculture biologique ou conventionnelle
5. **Hypothèses existantes**: suppositions déjà établies aux niveaux système/étape/intervention

## 🎯 TA MISSION

Estime l'EIQ pour cette intervention phytosanitaire.

### Définition de l'EIQ:

L'**EIQ (Environmental Impact Quotient)** mesure l'impact environnemental potentiel d'un pesticide sur 3 composantes:
- **Santé de l'applicateur** (farmer/applicator)
- **Santé du consommateur** (consumer)
- **Écologie** (ecology: faune, sol, air, eau)

**Formule Field Use EIQ:**
\`\`\`
Field Use EIQ = EIQ value × kg matière active / ha
\`\`\`

Où:
- **EIQ value**: coefficient d'impact de la matière active (base de données Cornell University)
- **kg matière active/ha**: quantité de matière active appliquée par hectare

### Étapes de raisonnement:

1. **Identifier la matière active**:
   - Nom de la matière active (ex: glyphosate, époxiconazole, lambda-cyhalothrine)
   - Nom commercial du produit (ex: Roundup, Opus, Karaté)
   - Concentration de matière active dans le produit (ex: 360 g/L, 125 g/L)

2. **Déterminer la quantité de matière active appliquée**:
   - À partir de la dose produit commercial (L/ha ou kg/ha)
   - Conversion: **kg m.a./ha = dose produit (L ou kg/ha) × concentration (g/L ou g/kg) / 1000**
   - Ex: 3 L/ha de glyphosate 360 g/L → 3 × 360 / 1000 = 1.08 kg m.a./ha

3. **Trouver la valeur EIQ de la matière active**:
   - Base de données Cornell University (référence mondiale)
   - Valeurs publiées par l'IRSTEA/INRAE (France)
   - Littérature scientifique récente

4. **Calculer le Field Use EIQ**:
   - Field Use EIQ = EIQ value × kg m.a./ha
   - Arrondir à l'entier le plus proche

5. **Gestion des mélanges**:
   - Si plusieurs matières actives → EIQ total = somme des Field Use EIQ individuels
   - Ex: Herbicide A (EIQ 50) + Herbicide B (EIQ 30) = EIQ total 80

### Valeurs EIQ de référence (matières actives courantes):

#### Herbicides:

**Matières actives classiques:**
- **Glyphosate**: EIQ = 15.3 (faible toxicité, usage répandu)
- **2,4-D**: EIQ = 14.7
- **Pendiméthaline**: EIQ = 19.8
- **S-métolachlore**: EIQ = 24.2
- **Trifluraline**: EIQ = 25.5

**Sulfonylurées (faible dose, impact modéré):**
- **Metsulfuron-méthyl**: EIQ = 21.6
- **Tribénuron-méthyl**: EIQ = 18.5

#### Fongicides:

**Triazoles:**
- **Époxiconazole**: EIQ = 37.2 (impact élevé)
- **Tébuconazole**: EIQ = 32.8
- **Prothioconazole**: EIQ = 28.9

**Strobilurines:**
- **Azoxystrobine**: EIQ = 32.5
- **Pyraclostrobine**: EIQ = 35.4

**Fongicides minéraux:**
- **Cuivre** (bouillie bordelaise): EIQ = 47.2 (impact élevé sur sol et faune)
- **Soufre**: EIQ = 4.9 (faible impact, autorisé bio)

**Autres:**
- **Mancozèbe**: EIQ = 25.1

#### Insecticides:

**Pyréthrinoïdes (haute toxicité faune):**
- **Lambda-cyhalothrine**: EIQ = 42.6 (très toxique abeilles et aquatique)
- **Deltaméthrine**: EIQ = 37.8
- **Cyperméthrine**: EIQ = 31.5

**Néonicotinoïdes (interdit/restreint):**
- **Imidaclopride**: EIQ = 35.9 (très toxique pollinisateurs)
- **Thiaméthoxam**: EIQ = 28.7

**Organophosphorés:**
- **Chlorpyrifos**: EIQ = 41.2 (interdit UE depuis 2020)
- **Diméthoate**: EIQ = 29.5

**Biocontrôle (faible impact):**
- **Bacillus thuringiensis**: EIQ = 12.3 (faible toxicité, spécifique lépidoptères)
- **Pyrèthre naturel**: EIQ = 18.4
- **Spinosad**: EIQ = 15.6

### Interprétation des valeurs EIQ:

**Field Use EIQ (par traitement):**
- **0-10**: Impact très faible
- **10-30**: Impact faible
- **30-60**: Impact modéré
- **60-100**: Impact élevé
- **> 100**: Impact très élevé

### ⚠️ CAS PARTICULIERS:

1. **Intervention non phytosanitaire**:
   - Désherbage mécanique, faux-semis, paillage → EIQ = 0
   - Retourner "N/A" si aucun produit phyto utilisé

2. **Produit non identifié**:
   - Si description vague ("traitement", "fongicide") sans matière active identifiable
   - Estimer EIQ moyen selon catégorie
   - Marquer confidence "low"

3. **Mélange de matières actives**:
   - Calculer Field Use EIQ pour chaque matière active
   - Sommer les valeurs individuelles

4. **Produits biocontrôle**:
   - Généralement EIQ plus faible (10-20)
   - Soufre, Bacillus, pyrèthre naturel: impact modéré mais autorisé bio

5. **Conversion dose produit → matière active**:
   - Produit commercial en L/ha: **kg m.a./ha = L/ha × g/L / 1000**
   - Produit commercial en kg/ha: **kg m.a./ha = kg/ha × g/kg / 1000 = kg/ha × % / 100**

6. **Cuivre et métaux lourds**:
   - Cuivre: EIQ élevé (47.2) malgré autorisation bio
   - Impact cumulatif sur sol (limite 28 kg Cu/ha sur 7 ans en bio)

**IMPORTANT** : L'EIQ n'est applicable que pour les interventions phytosanitaires (traitements herbicides, fongicides, insecticides). Pour toute autre intervention, retourne {"applicable": false, "value": 0, "reasoning": "L'EIQ ne s'applique qu'aux interventions phytosanitaires"}

**⚠️ IMPORTANT sur le champ "assumptions"** : Retourne la liste COMPLÈTE de TOUTES les hypothèses pertinentes pour cette intervention (pas seulement les nouvelles). Ces hypothèses remplaceront les précédentes stockées pour cette intervention.

**⚠️ CONSERVATION DES HYPOTHÈSES D'INTERVENTION** : Si des "Hypothèses spécifiques à l'intervention" te sont fournies dans le contexte ci-dessous, tu DOIS les conserver intégralement dans ta réponse, sauf si elles sont explicitement contredites ou modifiées par les nouvelles informations de cette interaction. Ne supprime JAMAIS des hypothèses d'intervention existantes sans raison valable.

**⚠️ VÉRIFICATION CRITIQUE** : Le champ "value" DOIT correspondre EXACTEMENT au résultat final de la dernière ligne de "calculation_steps". Si ton calcul donne 153, alors "value" doit être 153, PAS une autre valeur. Vérifie toujours cette cohérence avant de retourner le JSON.

**⚠️ COHÉRENCE DES CALCULS** :
- NE corrige PAS les résultats de tes calculs par des "ordres de grandeur métiers" ou "valeurs de référence". Si ton calcul donne 0.83, ne renvoie PAS 0.2 sous prétexte que "c'est plus proche des valeurs habituelles".
- Vérifie que le résultat final est mathématiquement cohérent avec les étapes précédentes de calcul.
- Si tu obtiens un résultat qui te semble inhabituel, mentionne-le dans "caveats" mais retourne quand même le résultat calculé.

Réponds UNIQUEMENT en JSON valide suivant ce format :
{
  "applicable": true | false,
  "value": <nombre entier (Field Use EIQ arrondi) ou 0 si non applicable>,
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

Calculer l'EIQ (Environmental Impact Quotient) pour cette intervention phytosanitaire.

# Instructions

1. Vérifie d'abord si l'intervention concerne un traitement phytosanitaire
2. Identifie la matière active et sa concentration
3. Détermine la quantité de matière active appliquée (kg m.a./ha)
4. Trouve la valeur EIQ de la matière active (base Cornell)
5. Calcule : Field Use EIQ = EIQ value × kg m.a./ha
6. Si mélange de produits, somme les EIQ individuels
7. Prends en compte les hypothèses des 3 niveaux

**⚠️ IMPORTANT** : 
- Le résultat doit être un nombre entier (Field Use EIQ arrondi)
- Désherbage mécanique → EIQ = 0
- Base de données Cornell University pour les valeurs EIQ

Réponds en JSON valide comme spécifié dans tes instructions système.
`;
  }

  getLabel(): string {
    return 'EIQ';
  }
}
