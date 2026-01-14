// Base Indicator Calculator Class
import { callGPT } from './openai-client';
import { CalculationContext, CalculationResult, ConversationMessage, ConfidenceLevel } from './types';
import { buildFrequencePrompt, FREQUENCE_SYSTEM_PROMPT } from './prompts/frequence';
import { buildTempsTravailPrompt, TEMPS_TRAVAIL_SYSTEM_PROMPT } from './prompts/temps-travail';
import { buildGesPrompt, GES_SYSTEM_PROMPT } from './prompts/ges';
import { buildAzoteMineralPrompt, AZOTE_MINERAL_SYSTEM_PROMPT } from './prompts/azote-mineral';
import { buildAzoteOrganiquePrompt, AZOTE_ORGANIQUE_SYSTEM_PROMPT } from './prompts/azote-organique';
import { buildRendementPrompt, RENDEMENT_SYSTEM_PROMPT } from './prompts/rendement';

/**
 * Clean JSON response from OpenAI (remove markdown code blocks)
 */
function cleanJsonResponse(response: string): string {
  let cleaned = response.trim();
  // Remove ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

export class IndicatorCalculator {
  /**
   * Calculate a single indicator value using AI
   * @param context - Calculation context with system data and target cell
   * @returns Calculation result with value, confidence, and conversation
   */
  async calculateIndicator(context: CalculationContext): Promise<CalculationResult> {
    const { systemData, stepIndex, interventionIndex, indicatorKey } = context;

    // Extract context
    const step = systemData.steps?.[stepIndex];
    const intervention = step?.interventions?.[interventionIndex];

    if (!step || !intervention) {
      throw new Error('Invalid step or intervention index');
    }

    // Build hierarchical assumptions
    const systemAssumptions = systemData.assumptions || '';
    const stepAssumptions = step.assumptions || '';
    const interventionAssumptions = intervention.assumptions || '';

    // Get appropriate prompt for this indicator
    const prompt = this.buildPrompt(indicatorKey, {
      intervention,
      step,
      systemData,
      systemAssumptions,
      stepAssumptions,
      interventionAssumptions,
    });

    // Call OpenAI with indicator-specific system prompt
    const systemMessage = this.getSystemPrompt(indicatorKey);
    
    const messages = [
      { role: 'system' as const, content: systemMessage },
      { role: 'user' as const, content: prompt },
    ];

    try {
      const response = await callGPT(messages);
      const cleanedResponse = cleanJsonResponse(response);
      const parsed = JSON.parse(cleanedResponse);

      // Build conversation history
      const conversation: ConversationMessage[] = [
        {
          role: 'system',
          content: `Calcul de l'indicateur "${indicatorKey}" pour l'intervention "${intervention.name}"`,
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: parsed.reasoning || 'Calcul effectué',
          timestamp: new Date().toISOString(),
          assumptions: parsed.assumptions || [],
          calculation_steps: parsed.calculation_steps || [],
          sources: parsed.sources || [],
          confidence: parsed.confidence || 'medium',
          caveats: parsed.caveats || [],
        },
      ];

      return {
        value: parsed.value,
        confidence: parsed.confidence || 'medium',
        conversation,
        sources: parsed.sources || [],
        calculationSteps: parsed.calculation_steps,
        caveats: parsed.caveats,
      };
    } catch (error: any) {
      throw new Error(`Failed to calculate indicator: ${error.message}`);
    }
  }

  /**
   * Refine an existing value through dialogue
   * @param context - Calculation context
   * @param userMessage - User's refinement request
   * @param existingConversation - Previous conversation history
   * @returns Updated calculation result
   */
  async refineValue(
    context: CalculationContext,
    userMessage: string,
    existingConversation: ConversationMessage[]
  ): Promise<CalculationResult> {
    const { systemData, stepIndex, interventionIndex, indicatorKey } = context;

    // Extract context
    const step = systemData.steps?.[stepIndex];
    const intervention = step?.interventions?.[interventionIndex];

    if (!step || !intervention) {
      throw new Error('Invalid step or intervention index');
    }

    // Build messages with conversation history
    const systemMessage = `Tu es un assistant expert en agronomie française. L'utilisateur veut affiner un calcul précédent. Prends en compte son message et recalcule si nécessaire. Réponds en JSON valide.`;
    
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemMessage },
    ];

    // Add existing conversation
    existingConversation.forEach((msg) => {
      if (msg.role !== 'system') {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    });

    // Add user's refinement request
    messages.push({
      role: 'user',
      content: `Demande de raffinement : ${userMessage}\n\nVeuillez recalculer la valeur si nécessaire et répondre en JSON avec : { "value": number, "confidence": "high"|"medium"|"low", "reasoning": string, "assumptions": string[], "calculation_steps": string[], "sources": string[], "caveats": string[] }\n\n**IMPORTANT** : Dans le "reasoning", commencez TOUJOURS par annoncer la nouvelle valeur calculée. Par exemple : "J'ai calculé une nouvelle valeur de 150 pour cet indicateur. Voici pourquoi : ..."`,
    });

    try {
      const response = await callGPT(messages);
      const cleanedResponse = cleanJsonResponse(response);
      const parsed = JSON.parse(cleanedResponse);

      // Build updated conversation
      const updatedConversation: ConversationMessage[] = [
        ...existingConversation,
        {
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: parsed.reasoning || 'Valeur raffinée',
          timestamp: new Date().toISOString(),
          assumptions: parsed.assumptions || [],
          calculation_steps: parsed.calculation_steps || [],
          sources: parsed.sources || [],
          confidence: parsed.confidence || 'medium',
          caveats: parsed.caveats || [],
        },
      ];

      return {
        value: parsed.value,
        confidence: parsed.confidence || 'medium',
        conversation: updatedConversation,
        sources: parsed.sources || [],
        calculationSteps: parsed.calculation_steps,
        caveats: parsed.caveats,
      };
    } catch (error: any) {
      throw new Error(`Failed to refine value: ${error.message}`);
    }
  }

  /**
   * Calculate all missing indicators in a system
   * @param systemData - Full system data
   * @returns Summary of calculations
   */
  async calculateAllMissing(systemData: any): Promise<{
    calculatedCount: number;
    summary: Array<{ stepIndex: number; interventionIndex: number; indicatorKey: string; value: any }>;
  }> {
    // Stub implementation - will be implemented in Phase 10
    return {
      calculatedCount: 0,
      summary: [],
    };
  }

  /**
   * Build a prompt for a specific indicator type
   * @param indicatorKey - The indicator to calculate
   * @param context - Context information
   * @returns Formatted prompt string
   */
  private buildPrompt(
    indicatorKey: string,
    context: {
      intervention: any;
      step: any;
      systemData: any;
      systemAssumptions: string;
      stepAssumptions: string;
      interventionAssumptions: string;
    }
  ): string {
    // Route to specific prompt based on indicator type
    switch (indicatorKey) {
      case 'frequence':
        return buildFrequencePrompt(context);
      
      case 'tempsTravail':
        return buildTempsTravailPrompt(context);
      
      case 'ges':
        return buildGesPrompt(context);
      
      case 'azoteMineral':
        return buildAzoteMineralPrompt(context);
      
      case 'azoteOrganique':
        return buildAzoteOrganiquePrompt(context);
      
      case 'rendementTMS':
      case 'rendement':
        return buildRendementPrompt(context);
      
      // Add more indicators as they are implemented
      default:
        // Fallback to generic prompt
        const { intervention, step, systemData, systemAssumptions, stepAssumptions, interventionAssumptions } = context;

        // Determine if this indicator should be per hectare
        const perHectareIndicators = [
          'azoteMineral', 'azoteOrganique', 'ges', 'tempsTravail',
          'coutsPhytos', 'semences', 'engrais', 'mecanisation', 'gnr', 'irrigation',
          'ift', 'eiq', 'rendementTMS', 'prixVente', 'margeBrute', 'totalCharges', 'totalProduits'
        ];
        const isPerHectare = perHectareIndicators.includes(indicatorKey);
        
        return `
# Contexte du système

${systemAssumptions ? `## Caractéristiques du système\n${systemAssumptions}\n` : ''}

${stepAssumptions ? `## Caractéristiques de l'étape "${step.name}"\n${stepAssumptions}\n` : ''}

${interventionAssumptions ? `## Caractéristiques de l'intervention\n${interventionAssumptions}\n` : ''}

# Intervention à analyser

**Nom** : ${intervention.name}
**Description** : ${intervention.description || 'Non spécifiée'}
**Type** : ${intervention.type}
**Date** : Jour ${intervention.day} après le début de l'étape

# Tâche

Calculer l'indicateur **"${indicatorKey}"** pour cette intervention.

${isPerHectare ? `\n**⚠️ IMPORTANT - CALCUL PAR HECTARE** : L'indicateur "${indicatorKey}" doit être exprimé **PAR HECTARE**. Toutes les valeurs doivent être ramenées à l'hectare (€/ha, kg/ha, h/ha, TeqCO2/ha, etc.). Si tu disposes de valeurs totales ou par surface différente, divise par la surface pour obtenir la valeur par hectare.\n` : ''}
# Format de réponse

Réponds en JSON valide avec cette structure :
\`\`\`json
{
  "value": <nombre ou "N/A">,
  "confidence": "high" | "medium" | "low",
  "reasoning": "Explication détaillée du calcul en français. COMMENCE TOUJOURS par annoncer la valeur calculée : 'J'ai calculé une valeur de X${isPerHectare ? ' €/ha' : ''}. Voici pourquoi : ...'",
  "assumptions": ["Liste des hypothèses prises"],
  "calculation_steps": ["Étapes du calcul"],
  "sources": ["Sources de données utilisées"],
  "caveats": ["Limitations ou avertissements"]
}
\`\`\`

**Important** : Si l'indicateur n'est pas applicable à cette intervention, retourne "N/A" comme valeur et explique pourquoi dans reasoning.
`;
    }
  }

  /**
   * Get system prompt for a specific indicator type
   * @param indicatorKey - The indicator type
   * @returns System prompt string
   */
  private getSystemPrompt(indicatorKey: string): string {
    switch (indicatorKey) {
      case 'frequence':
        return FREQUENCE_SYSTEM_PROMPT;
      
      case 'tempsTravail':
        return TEMPS_TRAVAIL_SYSTEM_PROMPT;
      
      case 'ges':
        return GES_SYSTEM_PROMPT;
      
      case 'azoteMineral':
        return AZOTE_MINERAL_SYSTEM_PROMPT;
      
      case 'azoteOrganique':
        return AZOTE_ORGANIQUE_SYSTEM_PROMPT;
      
      case 'rendementTMS':
      case 'rendement':
        return RENDEMENT_SYSTEM_PROMPT;
      
      // Add more indicators as they are implemented
      default:
        // Determine if this indicator should be per hectare
        const perHectareIndicators = [
          'azoteMineral', 'azoteOrganique', 'ges', 'tempsTravail',
          'coutsPhytos', 'semences', 'engrais', 'mecanisation', 'gnr', 'irrigation',
          'ift', 'eiq', 'rendementTMS', 'prixVente', 'margeBrute', 'totalCharges', 'totalProduits'
        ];
        const isPerHectare = perHectareIndicators.includes(indicatorKey);
        
        return `Tu es un assistant expert en agronomie française. Tu dois analyser les données agricoles et calculer des indicateurs avec précision.

${isPerHectare ? `**⚠️ RÈGLE CRITIQUE - CALCUL PAR HECTARE** : L'indicateur "${indicatorKey}" doit TOUJOURS être exprimé **PAR HECTARE**. Peu importe les données sources (totales, par parcelle, etc.), tu dois RAMENER le résultat final à l'hectare. Les unités attendues sont : €/ha, kg/ha, h/ha, TeqCO2/ha, uN/ha, qtx/ha selon l'indicateur.

Si tu disposes de :
- Valeurs totales pour une surface S : divise par S pour obtenir /ha
- Valeurs par parcelle de X ha : divise par X
- Valeurs en /100m² : multiplie par 100
- Valeurs en /are : multiplie par 100

Exemples :
- Coût total de semences 180 € pour 15 ha → 180/15 = 12 €/ha ✓
- Temps de travail 8h pour 20 ha → 8/20 = 0.4 h/ha ✓
- GES 150 kg pour 10 ha → 150/10 = 15 kg/ha = 0.015 TeqCO2/ha ✓

` : ''}Réponds toujours en JSON valide.`;
    }
  }
}

// Export singleton instance
export const indicatorCalculator = new IndicatorCalculator();
