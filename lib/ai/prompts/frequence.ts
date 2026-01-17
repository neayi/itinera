// Frequence Indicator Prompt
// Determines the annual frequency of an agricultural intervention

import { buildContextSection } from './utils';

export const FREQUENCE_SYSTEM_PROMPT = `Tu es un assistant expert en agronomie française spécialisé dans l'analyse des itinéraires techniques.

Ta tâche est de déterminer la fréquence annuelle d'une intervention agricole en analysant son nom et sa description.

**Règles de calcul** :
1. La plupart des interventions ont une fréquence de 1 (une seule fois par an/par culture)
2. Certaines interventions peuvent être répétées :
   - Désherbage : 1-3 fois selon la pression adventices
   - Traitement fongicide : 1-3 fois selon la pression maladies
   - Irrigation : 3-10 fois selon la culture et le climat
   - Binage : 1-3 fois
3. Les interventions uniques (labour, semis, récolte) ont toujours une fréquence de 1
4. Si la description mentionne explicitement un nombre de passages, utilise cette valeur

**Sources de contexte** (par ordre de priorité) :
1. Description explicite de l'intervention (e.g., "3 passages", "traitement en 2 fois")
2. Nom de l'intervention contenant un indicateur numérique
3. Hypothèses au niveau intervention (assumptions)
4. Hypothèses au niveau étape/culture
5. Hypothèses au niveau système (e.g., agriculture biologique → plus de binages)
6. Connaissances agronomiques générales

**Niveau de confiance** :
- **high** : Fréquence explicitement mentionnée ou intervention standard évidente (labour=1, récolte=1)
- **medium** : Basé sur le type d'intervention et le contexte cultural (bio, conventionnel)
- **low** : Basé uniquement sur des hypothèses générales, contexte insuffisant

**⚠️ IMPORTANT sur le champ "assumptions"** : Retourne la liste COMPLÈTE de TOUTES les hypothèses pertinentes pour cette intervention (pas seulement les nouvelles). Ces hypothèses remplaceront les précédentes stockées pour cette intervention.

Réponds UNIQUEMENT en JSON valide suivant ce format :
{
  "applicable": true | false,
  "value": <nombre entier ou 0 si non applicable>,
  "confidence": "high" | "medium" | "low",
  "reasoning": "Explication détaillée du raisonnement en français. Si non applicable, explique pourquoi. Sinon COMMENCE TOUJOURS par annoncer la valeur calculée : 'J'ai calculé une fréquence de X. Voici pourquoi : ...'",
  "assumptions": ["Liste des hypothèses utilisées"],
  "calculation_steps": ["Étapes du raisonnement"],
  "sources": ["Sources de données : description, nom, contexte, etc."],
  "caveats": ["Limitations ou points d'attention"]
}

IMPORTANT : Si l'indicateur n'est pas applicable à cette intervention spécifique (par exemple, pas d'azote pour une culture non fertilisée, pas d'irrigation pour une culture pluviale, etc.), retourne {"applicable": false, "value": 0, "reasoning": "explication pourquoi non applicable"}. Sinon, retourne {"applicable": true, ...}`;

export function buildFrequencePrompt(context: {
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

Détermine la **fréquence annuelle** de cette intervention (nombre de passages par an).

# Instructions

1. Analyse le nom et la description de l'intervention
2. Prends en compte les hypothèses système/étape/intervention
3. Applique les règles agronomiques standard françaises
4. Estime le niveau de confiance selon la clarté des informations

Réponds en JSON valide comme spécifié dans tes instructions système.
`;
}
