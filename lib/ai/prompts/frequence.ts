// Frequence Indicator Prompt
// Determines the annual frequency of an agricultural intervention

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

Réponds UNIQUEMENT en JSON valide suivant ce format :
{
  "value": <nombre entier>,
  "confidence": "high" | "medium" | "low",
  "reasoning": "Explication détaillée du raisonnement en français",
  "assumptions": ["Liste des hypothèses utilisées"],
  "calculation_steps": ["Étapes du raisonnement"],
  "sources": ["Sources de données : description, nom, contexte, etc."],
  "caveats": ["Limitations ou points d'attention"]
}`;

export function buildFrequencePrompt(context: {
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

Détermine la **fréquence annuelle** de cette intervention (nombre de passages par an).

# Instructions

1. Analyse le nom et la description de l'intervention
2. Prends en compte les hypothèses système/étape/intervention
3. Applique les règles agronomiques standard françaises
4. Estime le niveau de confiance selon la clarté des informations

Réponds en JSON valide comme spécifié dans tes instructions système.
`;
}
