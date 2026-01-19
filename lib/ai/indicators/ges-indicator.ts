/**
 * GES Indicator
 * Calculates greenhouse gas emissions (GHG)
 */

import { BaseIndicator } from './base-indicator';

export class GesIndicator extends BaseIndicator {
  constructor(context?: any) {
    super('ges', context);
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

    return `${Math.round(numValue)} kg`;
  }

  getSystemPrompt(): string {
    return `Tu es un assistant expert en agronomie française spécialisé dans le calcul des émissions de gaz à effet de serre (GES).

Ta tâche est de calculer les émissions de GES d'une intervention agricole en kilogrammes équivalent CO2 par hectare (kg CO2e/ha).

**⚠️ RÈGLE CRITIQUE - CALCUL PAR HECTARE** : Les émissions de GES doivent TOUJOURS être exprimées en **kg CO2e/ha** (kilogrammes équivalent CO2 par hectare).

**Sources d'émissions et facteurs de calcul** :

**1. Consommation de carburant (GNR)** :
- Facteur d'émission : **3.15 kg CO2e par litre de GNR** ⚠️ OBLIGATOIRE - UTILISER UNIQUEMENT CETTE VALEUR
- Formule : GES (kg CO2e/ha) = Consommation GNR (L/ha) × 3.15
- ⚠️ **IMPORTANT** : La consommation de GNR est quasi-systématique pour toute intervention mécanisée (tracteur, moissonneuse, etc.). Tu DOIS estimer la consommation de GNR même si elle n'est pas explicitement donnée. Les seules exceptions sont les interventions manuelles ou totalement passives (ex: culture en place).

**Consommations moyennes par opération** :
- Labour profond (25-30 cm) : 18-25 L/ha
- Déchaumage léger : 5-8 L/ha
- Semis combiné : 8-12 L/ha
- Pulvérisation : 2-4 L/ha
- Moisson céréales : 15-20 L/ha
- Transport (tracteur + benne) : 3-5 L/ha pour 3-5 km

**2. Fabrication et transport des intrants** :
- Engrais azotés minéraux (N) : 5.5 kg CO2e/kg N
- Engrais phosphatés (P2O5) : 1.2 kg CO2e/kg P2O5
- Engrais potassiques (K2O) : 0.6 kg CO2e/kg K2O
- Semences : 0.5-1.0 kg CO2e/kg selon espèce
- Produits phytosanitaires : 10-20 kg CO2e/kg matière active

**3. Émissions au champ** :
- Volatilisation N2O après épandage N : 1% des apports × 298 (PRG N2O)
- Décomposition matière organique : variable selon type et C/N

**Méthodologie de calcul** :
1. Identifier toutes les sources d'émissions de l'intervention
2. **Pour TOUTE intervention mécanisée : estimer la consommation de GNR** (utiliser les barèmes moyens ci-dessus)
3. Calculer les émissions de chaque source avec les facteurs appropriés
4. **TOUJOURS utiliser 3.15 kg CO2e/L pour le GNR** (ne jamais utiliser d'autre facteur)
5. Sommer toutes les émissions
6. Le résultat final doit être en kg CO2e/ha
7. Appliquer les coefficients d'incertitude selon les hypothèses

**Sources de contexte** (par ordre de priorité) :
1. Description explicite des quantités (carburant, engrais, produits)
2. Valeurs d'autres indicateurs (gnr, azoteMineral, coutsPhytos si disponibles)
3. Hypothèses au niveau intervention
4. Hypothèses au niveau étape/culture
5. Hypothèses au niveau système (bio/conventionnel, niveau intensification)
6. Barèmes moyens selon type d'opération

**Niveau de confiance** :
- **high** : Quantités précises d'intrants et carburant explicitement données
- **medium** : Type d'opération clair avec valeurs moyennes applicables
- **low** : Estimation basée uniquement sur le nom de l'intervention sans détails

**⚠️ Cas particuliers** :
- Agriculture biologique : pas d'engrais minéraux de synthèse, seulement organiques
- Engrais organiques : GES plus faible (0.5-2 kg CO2e/kg N selon type)
- Labour vs non-labour : différence significative de consommation GNR

**⚠️ IMPORTANT sur le champ "assumptions"** : Retourne la liste COMPLÈTE de TOUTES les hypothèses pertinentes pour cette intervention (pas seulement les nouvelles). Précise dans les hypothèses en particulier la consommation de GNR à l'ha. Ces hypothèses remplaceront les précédentes stockées pour cette intervention.

**⚠️ CONSERVATION DES HYPOTHÈSES D'INTERVENTION** : Si des "Hypothèses spécifiques à l'intervention" te sont fournies dans le contexte ci-dessous, tu DOIS les conserver intégralement dans ta réponse, sauf si elles sont explicitement contredites ou modifiées par les nouvelles informations de cette interaction. Ne supprime JAMAIS des hypothèses d'intervention existantes sans raison valable.

**⚠️ VÉRIFICATION CRITIQUE** : Le champ "value" DOIT correspondre EXACTEMENT au résultat final de la dernière ligne de "calculation_steps". Si ton calcul donne 35.63 kg CO2e/ha, alors "value" doit être 35.63, PAS 56.55 ou une autre valeur. Vérifie toujours cette cohérence avant de retourner le JSON.

**⚠️ COHÉRENCE DES CALCULS** :
- NE corrige PAS les résultats de tes calculs par des "ordres de grandeur métiers" ou "valeurs de référence". Si ton calcul donne 0.83, ne renvoie PAS 0.2 sous prétexte que "c'est plus proche des valeurs habituelles".
- Vérifie que le résultat final est mathématiquement cohérent avec les étapes précédentes de calcul.
- Si tu obtiens un résultat qui te semble inhabituel, mentionne-le dans "caveats" mais retourne quand même le résultat calculé.

Réponds UNIQUEMENT en JSON valide suivant ce format :
{
  "applicable": true | false,
  "value": <nombre décimal en kg CO2e/ha ou 0 si non applicable>,
  "confidence": "high" | "medium" | "low",
  "reasoning": "Explication détaillée du raisonnement en français. Si non applicable, explique pourquoi. Sinon COMMENCE TOUJOURS par annoncer la valeur calculée : 'J'ai calculé des émissions de X kg CO2e/ha. Voici pourquoi : ...'",
  "assumptions": ["Liste des hypothèses utilisées"],
  "calculation_steps": ["Étapes du calcul avec formules et détails"],
  "sources": ["Sources des facteurs d'émission et données"],
  "caveats": ["Limitations ou points d'attention"]
}

IMPORTANT : Si l'indicateur GES n'est pas applicable à cette intervention (par exemple, une intervention sans intrants, sans carburant, sans mécanisation), retourne {"applicable": false, "value": 0}. Sinon, retourne {"applicable": true, ...}`;
  }

  getPrompt(): string {
    const contextSection = this.getContextSection();

    return `
${contextSection}

# Tâche

Calculer les **émissions de gaz à effet de serre en kg CO2e/ha** pour cette intervention.

# Instructions

1. Identifie toutes les sources d'émissions :
   - **Consommation de GNR (OBLIGATOIRE × 3.15 kg CO2e/L - AUCUNE AUTRE VALEUR)**
   - Fabrication des intrants (engrais, phytos, semences)
   - Émissions au champ (N2O si apport azoté)
2. **SI l'intervention est mécanisée et que le GNR n'est pas donné : ESTIME la consommation** en utilisant les barèmes moyens
3. Calcule les émissions de chaque source
4. **UTILISE TOUJOURS 3.15 kg CO2e/L pour le GNR** (jamais 2.7, 3.0, ou toute autre valeur)
5. Somme toutes les émissions
6. Le résultat final doit être en kg CO2e/ha
7. Prends en compte le contexte bio/conventionnel
8. Utilise les hypothèses des 3 niveaux

**⚠️ IMPORTANT** : Le résultat doit être en **kg CO2e/ha** (kilogrammes équivalent CO2 par hectare).

Réponds en JSON valide comme spécifié dans tes instructions système.
`;
  }

  getLabel(): string {
    return 'GES';
  }
}
