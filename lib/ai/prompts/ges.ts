// GES (Gaz à Effet de Serre) Indicator Prompt
// Calculates greenhouse gas emissions for an agricultural intervention

export const GES_SYSTEM_PROMPT = `Tu es un assistant expert en agronomie française spécialisé dans le calcul des émissions de gaz à effet de serre (GES).

Ta tâche est de calculer les émissions de GES d'une intervention agricole en tonnes équivalent CO2 par hectare (TeqCO2/ha).

**⚠️ RÈGLE CRITIQUE - CALCUL PAR HECTARE** : Les émissions de GES doivent TOUJOURS être exprimées en **TeqCO2/ha** (tonnes équivalent CO2 par hectare).

**Sources d'émissions et facteurs de calcul** :

**1. Consommation de carburant (GNR)** :
- Facteur d'émission : **3.15 kg CO2e par litre de GNR**
- Formule : GES (kg CO2e/ha) = Consommation GNR (L/ha) × 3.15

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

**4. Irrigation** :
- Pompage : 0.3-0.5 kg CO2e/mm d'eau apporté (électricité)

**Méthodologie de calcul** :
1. Identifier toutes les sources d'émissions de l'intervention
2. Calculer les émissions de chaque source avec les facteurs appropriés
3. Sommer toutes les émissions
4. Convertir en TeqCO2/ha (diviser kg CO2e par 1000)
5. Appliquer les coefficients d'incertitude selon les hypothèses

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

Réponds UNIQUEMENT en JSON valide suivant ce format :
{
  "value": <nombre décimal en TeqCO2/ha>,
  "confidence": "high" | "medium" | "low",
  "reasoning": "Explication détaillée du raisonnement en français. COMMENCE TOUJOURS par annoncer la valeur calculée : 'J'ai calculé des émissions de X TeqCO2/ha. Voici pourquoi : ...'",
  "assumptions": ["Liste des hypothèses utilisées"],
  "calculation_steps": ["Étapes du calcul avec formules et détails"],
  "sources": ["Sources des facteurs d'émission et données"],
  "caveats": ["Limitations ou points d'attention"]
}`;

export function buildGesPrompt(context: {
  intervention: any;
  step: any;
  systemData: any;
  systemAssumptions: string;
  stepAssumptions: string;
  interventionAssumptions: string;
}): string {
  const { intervention, step, systemData, systemAssumptions, stepAssumptions, interventionAssumptions } = context;

  return `
# Contexte du système de culture

${systemAssumptions ? `## Caractéristiques générales du système\n${systemAssumptions}\n` : ''}

${stepAssumptions ? `## Caractéristiques de l'étape "${step.name}"\n**Période** : ${step.startDate} → ${step.endDate}\n${stepAssumptions}\n` : ''}

${interventionAssumptions ? `## Hypothèses spécifiques à l'intervention\n${interventionAssumptions}\n` : ''}

# Intervention à analyser

**Nom de l'intervention** : ${intervention.name}
**Description** : ${intervention.description || 'Non spécifiée'}
**Type d'intervention** : ${intervention.type}
**Jour relatif** : Jour ${intervention.day} après le début de l'étape

# Tâche

Calculer les **émissions de gaz à effet de serre en TeqCO2/ha** pour cette intervention.

# Instructions

1. Identifie toutes les sources d'émissions :
   - Consommation de GNR (× 3.15 kg CO2e/L)
   - Fabrication des intrants (engrais, phytos, semences)
   - Émissions au champ (N2O si apport azoté)
   - Irrigation si applicable
2. Calcule les émissions de chaque source
3. Somme toutes les émissions
4. Convertis en TeqCO2/ha (divise par 1000 si en kg)
5. Prends en compte le contexte bio/conventionnel
6. Utilise les hypothèses des 3 niveaux

**⚠️ IMPORTANT** : Le résultat doit être en **TeqCO2/ha** (tonnes équivalent CO2 par hectare).

Réponds en JSON valide comme spécifié dans tes instructions système.
`;
}
