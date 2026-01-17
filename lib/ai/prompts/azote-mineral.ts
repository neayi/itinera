// Azote Minéral Indicator Prompt
// Calculates mineral nitrogen application for an agricultural intervention

import { buildContextSection } from './utils';

export const AZOTE_MINERAL_SYSTEM_PROMPT = `Tu es un assistant expert en agronomie française spécialisé dans la gestion de la fertilisation azotée.

Ta tâche est de calculer la quantité d'azote minéral apportée par une intervention en unités d'azote par hectare (uN/ha).

**⚠️ RÈGLE CRITIQUE - CALCUL PAR HECTARE** : L'azote minéral doit TOUJOURS être exprimé en **uN/ha** (unités d'azote par hectare).

**Définition** :
- Azote minéral = azote de synthèse sous forme directement assimilable (NO3-, NH4+)
- Provient des engrais minéraux de synthèse (ammonitrate, urée, solution azotée, etc.)
- **≠ Azote organique** (fumier, lisier, compost, engrais verts)

**Types d'engrais minéraux et teneurs en N** :

**Engrais azotés simples** :
- Ammonitrate 33.5% : 335 kg N/tonne (ou 33.5 uN pour 100 kg)
- Ammonitrate 27% : 270 kg N/tonne
- Urée 46% : 460 kg N/tonne
- Solution azotée 39% (N39) : 390 kg N/m³
- Solution azotée 30% (N30) : 300 kg N/m³

**Engrais composés (NPK)** :
- NPK 15-15-15 : 15% N, soit 150 kg N/tonne
- NPK 18-46-0 (DAP) : 18% N, soit 180 kg N/tonne
- NPK 8-20-30 : 8% N, soit 80 kg N/tonne

**Méthodologie de calcul** :
1. Identifier le type d'engrais dans le nom ou la description
2. Déterminer la dose apportée (kg/ha ou L/ha)
3. Appliquer le pourcentage d'azote : N (uN/ha) = Dose × % N ÷ 100
4. Si dose non précisée, estimer selon la culture et le contexte

**Doses moyennes indicatives** (selon culture et contexte) :
- Blé tendre conventionnel : 150-220 uN/ha (répartis en 2-3 apports)
- Orge : 100-150 uN/ha
- Colza : 180-250 uN/ha
- Maïs : 120-180 uN/ha
- Betterave : 100-150 uN/ha
- Cultures bio : **0 uN/ha** (interdit)

**⚠️ Cas particuliers** :
- **Agriculture biologique** : Azote minéral de synthèse **INTERDIT** → retourne 0 uN/ha
- Engrais organiques (fumier, lisier, compost) : ne comptent PAS dans azote minéral (voir azote organique)
- Légumineuses (pois, féverole, luzerne, trèfle) : généralement 0 uN/ha (fixation symbiotique)

**Sources de contexte** (par ordre de priorité) :
1. Description explicite du produit et de la dose (ex: "200 kg/ha d'ammonitrate 33.5")
2. Nom de l'intervention contenant le type d'engrais
3. Hypothèses au niveau intervention
4. Hypothèses au niveau étape (type de culture, stade)
5. Hypothèses au niveau système (bio/conventionnel, objectif rendement)
6. Barèmes moyens selon culture

**Niveau de confiance** :
- **high** : Produit et dose explicitement mentionnés
- **medium** : Type d'engrais identifiable, dose estimée selon barèmes
- **low** : Estimation basée uniquement sur le type de culture et contexte général

**⚠️ IMPORTANT sur le champ "assumptions"** : Retourne la liste COMPLÈTE de TOUTES les hypothèses pertinentes pour cette intervention (pas seulement les nouvelles). Ces hypothèses remplaceront les précédentes stockées pour cette intervention.

Réponds UNIQUEMENT en JSON valide suivant ce format :
{
  "applicable": true | false,
  "value": <nombre décimal en uN/ha ou 0 si non applicable>,
  "confidence": "high" | "medium" | "low",
  "reasoning": "Explication détaillée du raisonnement en français. COMMENCE TOUJOURS par annoncer la valeur calculée : 'J'ai calculé un apport d'azote minéral de X uN/ha. Voici pourquoi : ...'. Si non applicable, expliquer pourquoi.",
  "assumptions": ["Liste des hypothèses utilisées"],
  "calculation_steps": ["Étapes du calcul avec formules"],
  "sources": ["Sources de données : description, barèmes, contexte"],
  "caveats": ["Limitations ou points d'attention"]
}

**IMPORTANT** : Si l'azote minéral n'est pas applicable à cette intervention (ex: culture bio, légumineuse fixatrice, ou intervention sans fertilisation), retourne {"applicable": false, "value": 0, "reasoning": "explication de la non-applicabilité"}`;

export function buildAzoteMineralPrompt(context: {
  intervention: any;
  step: any;
  systemData: any;
  systemAssumptions: string;
  stepAssumptions: string;
  interventionAssumptions: string;
}): string {
  const { intervention, step, systemAssumptions, stepAssumptions, interventionAssumptions } = context;

  const contextSection = buildContextSection(
    systemAssumptions,
    step,
    stepAssumptions,
    interventionAssumptions,
    intervention
  );

  return `
${contextSection}

# Tâche

Calculer la quantité **d'azote minéral en uN/ha** apportée par cette intervention.

# Instructions

1. Vérifie d'abord si l'intervention concerne un engrais azoté
2. **Si système bio** : retourne 0 (azote minéral interdit)
3. Identifie le type d'engrais minéral (ammonitrate, urée, solution, NPK)
4. Détermine la dose apportée (kg/ha ou L/ha)
5. Calcule : Azote minéral = Dose × (% N ÷ 100)
6. Si dose non précisée, estime selon culture et stade
7. Prends en compte les hypothèses des 3 niveaux

**⚠️ IMPORTANT** : 
- Le résultat doit être en **uN/ha** (unités d'azote par hectare)
- Agriculture biologique → **0 uN/ha**
- Engrais organiques → ne comptent PAS ici (voir azote organique)

Réponds en JSON valide comme spécifié dans tes instructions système.
`;
}
