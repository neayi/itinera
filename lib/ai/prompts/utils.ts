/**
 * Utility functions for building AI prompts
 */

/**
 * Calculate intervention date from step start date and intervention day offset
 * @returns Date formatted as DD/MM (without year)
 */
export function getInterventionDate(step: any, intervention: any): string {
  try {
    const startDate = new Date(step.startDate);
    const interventionDate = new Date(startDate);
    interventionDate.setDate(startDate.getDate() + parseInt(intervention.day || 0));
    const day = String(interventionDate.getDate()).padStart(2, '0');
    const month = String(interventionDate.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  } catch {
    return 'non calculable';
  }
}

/**
 * Build common context section for all prompts
 * Includes system assumptions, step info, and intervention details
 */
export function buildContextSection(
  systemAssumptions: string,
  step: any,
  stepAssumptions: string,
  interventionAssumptions: string,
  intervention: any
): string {
  const interventionDate = getInterventionDate(step, intervention);

  return `# Contexte du système de culture

${systemAssumptions ? `## Hypothèses générales du système
    
${systemAssumptions}\n` : ''}

## Étape de culture

**Nom de l'étape** : ${step.name}
**Description de l'étape** : ${step.description || 'Non spécifiée'}
**Période** : ${step.startDate} → ${step.endDate}

${stepAssumptions ? `**Hypothèses de l'étape** :\n${stepAssumptions}\n` : ''}

${interventionAssumptions ? `## Hypothèses spécifiques à l'intervention\n${interventionAssumptions}\n` : ''}

# Intervention à analyser

**Nom de l'intervention** : ${intervention.name}
**Date de l'intervention** : ${interventionDate}
**Description** : ${intervention.description || 'Non spécifiée'}
`;
}
