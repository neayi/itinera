/**
 * Utility functions for building AI prompts
 */

import { getIndicatorLabel } from '@/lib/indicator-labels';
import { formatValue, type FieldKey } from '@/components/interventions-table/formatters';

/**
 * Format a value with its unit according to indicator type
 * Adds /ha suffix for per-hectare indicators to be explicit in prompts
 */
function formatIndicatorValue(value: number | string | null | undefined, fieldKey: string): string {
  const baseFormatted = formatValue(value, fieldKey as FieldKey);
  
  // For per-hectare indicators, add /ha if not already present
  const perHectareIndicators = [
    'azoteMineral', 'azoteOrganique', 'ges', 'tempsTravail',
    'coutsPhytos', 'semences', 'engrais', 'mecanisation', 'gnr', 'irrigation',
    'rendementTMS', 'rendement', 'prixVente'
  ];
  
  if (perHectareIndicators.includes(fieldKey) && baseFormatted !== '-' && !baseFormatted.includes('/ha')) {
    return baseFormatted + '/ha';
  }
  
  return baseFormatted;
}

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
 * Includes system assumptions, step info, intervention details, and other indicator values
 * @param currentIndicatorKey - The key of the indicator being calculated (to exclude it from the list)
 */
export function buildContextSection(
  systemAssumptions: string[],
  step: any,
  stepAssumptions: string[],
  interventionAssumptions: string[],
  intervention: any,
  currentIndicatorKey?: string
): string {
  const interventionDate = getInterventionDate(step, intervention);

  // Build list of other indicators already calculated (excluding current indicator)
  let otherIndicatorsSection = '';
  if (intervention.values && intervention.values.length > 0) {
    const indicatorsList: string[] = [];
    
    intervention.values.forEach((valueEntry: any) => {
      // Exclude the current indicator being calculated
      if (valueEntry.key !== currentIndicatorKey && 
          valueEntry.value !== null && valueEntry.value !== undefined) {
        const label = getIndicatorLabel(valueEntry.key);
        const formattedValue = formatIndicatorValue(valueEntry.value, valueEntry.key);
        indicatorsList.push(`- **${label}** : ${formattedValue}`);
      }
    });

    if (indicatorsList.length > 0) {
      otherIndicatorsSection = `\n## Valeurs des autres indicateurs déjà calculés\n\nPour assurer la cohérence entre les calculs, voici les valeurs des autres indicateurs déjà calculés pour cette intervention :\n\n${indicatorsList.join('\n')}\n\n**⚠️ Utilise ces valeurs si elles sont pertinentes pour ton calcul** (par exemple, utilise la valeur de GNR si elle existe pour calculer les émissions GES du carburant).\n`;
    }
  }

  return `# Contexte du système de culture

${systemAssumptions.length > 0 ? `## Hypothèses générales du système
    
${systemAssumptions.map(a => `- ${a}`).join('\n')}\n` : ''}

## Étape de culture

**Nom de l'étape** : ${step.name}
**Description de l'étape** : ${step.description || 'Non spécifiée'}
**Période** : ${step.startDate} → ${step.endDate}

${stepAssumptions.length > 0 ? `**Hypothèses de l'étape** :\n${stepAssumptions.map(a => `- ${a}`).join('\n')}\n` : ''}

${interventionAssumptions.length > 0 ? `## Hypothèses spécifiques à l'intervention\n${interventionAssumptions.map(a => `- ${a}`).join('\n')}\n` : ''}

# Intervention à analyser

**Nom de l'intervention** : ${intervention.name}
**Date de l'intervention** : ${interventionDate}
**Description** : ${intervention.description || 'Non spécifiée'}

# Indicateurs connus pour cette intervention (à utiliser dans tes calculs si pertinent)
${otherIndicatorsSection}

`;
}
