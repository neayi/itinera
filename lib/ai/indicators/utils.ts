/**
 * Utility functions for indicators
 */

/**
 * Calculate intervention date from step start date and intervention day offset
 * @returns Date formatted as DD/MM (without year)
 */
function getInterventionDate(step: any, intervention: any): string {
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
 * Build common context section for prompts
 * Includes system assumptions, step info, intervention details, and other indicator values
 * Extracts and converts assumptions from systemData automatically
 * 
 * @param key - The indicator key being calculated
 * @param systemData - The full system data
 * @param stepIndex - Index of the step
 * @param interventionIndex - Index of the intervention
 * @returns Formatted context string for prompts
 */
export function buildContextSection(
    key: string,
    systemData: any,
    stepIndex: number,
    interventionIndex: number
): string {
    if (!systemData || stepIndex === undefined || interventionIndex === undefined) {
        return '';
    }

    const step = systemData.steps?.[stepIndex];
    const intervention = step?.interventions?.[interventionIndex];

    if (!step || !intervention) {
        return '';
    }

    // Extract hierarchical assumptions
    // Support both array (new format) and string (old format) for backward compatibility
    const systemAssumptions = systemData.assumptions || [];
    const stepAssumptions = step.assumptions || [];
    const interventionAssumptions = intervention.assumptions || [];

    // Convert to arrays if they're still stored as strings (backward compatibility)
    const systemAssumptionsArray = Array.isArray(systemAssumptions)
        ? systemAssumptions
        : (systemAssumptions ? systemAssumptions.split('\n').filter(Boolean) : []);
    const stepAssumptionsArray = Array.isArray(stepAssumptions)
        ? stepAssumptions
        : (stepAssumptions ? stepAssumptions.split('\n').filter(Boolean) : []);
    const interventionAssumptionsArray = Array.isArray(interventionAssumptions)
        ? interventionAssumptions
        : (interventionAssumptions ? interventionAssumptions.split('\n').filter(Boolean) : []);

    const interventionDate = getInterventionDate(step, intervention);

    // Build list of other indicators already calculated (excluding current indicator)
    // Use dynamic import to avoid circular dependency
    let otherIndicatorsSection = '';
    if (intervention.values && intervention.values.length > 0) {
        const indicatorsList: string[] = [];

        intervention.values.forEach((valueEntry: any) => {
            // Exclude the current indicator being calculated
            if (valueEntry.key !== key &&
                valueEntry.value !== null && valueEntry.value !== undefined) {
                try {
                    // Dynamic import to break circular dependency
                    const { IndicatorFactory } = require('./indicator-factory');
                    const indicator = IndicatorFactory.create(valueEntry.key, { systemData, stepIndex, interventionIndex });
                    const label = indicator.getLabel();
                    const formattedValue = indicator.formatIndicatorValue();
                    indicatorsList.push(`- **${label}** : ${formattedValue}`);
                } catch (e) {
                    // Fallback if indicator not found
                }
            }
        });

        if (indicatorsList.length > 0) {
            otherIndicatorsSection = `\n## Valeurs des autres indicateurs déjà calculés\n\nPour assurer la cohérence entre les calculs, voici les valeurs des autres indicateurs déjà calculés pour cette intervention :\n\n${indicatorsList.join('\n')}\n\n**⚠️ Utilise ces valeurs si elles sont pertinentes pour ton calcul** (par exemple, utilise la valeur de GNR si elle existe pour calculer les émissions GES du carburant).\n`;
        }
    }

    return `# Contexte du système de culture

${systemAssumptionsArray.length > 0 ? `## Hypothèses générales du système
    
${systemAssumptionsArray.map((a: string) => `- ${a}`).join('\n')}\n` : ''}

## Étape de culture

**Nom de l'étape** : ${step.name}
**Description de l'étape** : ${step.description || 'Non spécifiée'}
**Période** : ${step.startDate} → ${step.endDate}

${stepAssumptionsArray.length > 0 ? `**Hypothèses de l'étape** :\n${stepAssumptionsArray.map((a: string) => `- ${a}`).join('\n')}\n` : ''}

${interventionAssumptionsArray.length > 0 ? `## Hypothèses spécifiques à l'intervention\n${interventionAssumptionsArray.map((a: string) => `- ${a}`).join('\n')}\n` : ''}

# Intervention à analyser

**Nom de l'intervention** : ${intervention.name}
**Date de l'intervention** : ${interventionDate}
**Description** : ${intervention.description || 'Non spécifiée'}

# Indicateurs connus pour cette intervention (à utiliser dans tes calculs si pertinent)
${otherIndicatorsSection}

`;
}
