// Base Indicator Calculator Class
import { callGPT } from './openai-client';
import { CalculationContext, CalculationResult, ConversationMessage, ConfidenceLevel } from './types';
import { buildFrequencePrompt, FREQUENCE_SYSTEM_PROMPT } from './prompts/frequence';
import { buildTempsTravailPrompt, TEMPS_TRAVAIL_SYSTEM_PROMPT } from './prompts/temps-travail';
import { buildGesPrompt, GES_SYSTEM_PROMPT } from './prompts/ges';
import { buildAzoteMineralPrompt, AZOTE_MINERAL_SYSTEM_PROMPT } from './prompts/azote-mineral';
import { buildAzoteOrganiquePrompt, AZOTE_ORGANIQUE_SYSTEM_PROMPT } from './prompts/azote-organique';
import { buildRendementPrompt, RENDEMENT_SYSTEM_PROMPT } from './prompts/rendement';
import { buildContextSection } from './prompts/utils';
import { COUTS_PHYTOS_PROMPT } from './prompts/couts-phytos';
import { SEMENCES_PROMPT } from './prompts/semences';
import { ENGRAIS_PROMPT } from './prompts/engrais';
import { MECANISATION_PROMPT } from './prompts/mecanisation';
import { GNR_PROMPT } from './prompts/gnr';
import { IRRIGATION_PROMPT } from './prompts/irrigation';
import { IFT_PROMPT } from './prompts/ift';
import { EIQ_PROMPT } from './prompts/eiq';
import { PRIX_VENTE_PROMPT } from './prompts/prix-vente';

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

/**
 * Calculate intervention date from step start date and intervention day offset
 * Returns date formatted as DD/MM (without year)
 */
function formatInterventionDate(stepStartDate: string, interventionDay: number): string {
  try {
    const startDate = new Date(stepStartDate);
    const interventionDate = new Date(startDate);
    interventionDate.setDate(startDate.getDate() + interventionDay);
    
    const day = String(interventionDate.getDate()).padStart(2, '0');
    const month = String(interventionDate.getMonth() + 1).padStart(2, '0');
    
    return `${day}/${month}`;
  } catch (error) {
    return 'Date non calculable';
  }
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

    // Debug logs (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('\n========== AI PROMPT DEBUG ==========');
      console.log(`Indicator: ${indicatorKey}`);
      console.log(`Intervention: ${intervention.name}`);
      console.log('\n--- SYSTEM MESSAGE ---');
      console.log(systemMessage);
      console.log('\n--- USER PROMPT ---');
      console.log(prompt);
      console.log('=====================================\n');
    }

    try {
      const response = await callGPT(messages);
      const cleanedResponse = cleanJsonResponse(response);
      const parsed = JSON.parse(cleanedResponse);

      // Debug logs (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('\n========== AI RESPONSE DEBUG ==========');
        console.log(`Indicator: ${indicatorKey}`);
        console.log(response);
        console.log('=======================================\n');
      }

      // Store updated assumptions in intervention (replacing previous ones)
      if (parsed.assumptions && parsed.assumptions.length > 0) {
        intervention.assumptions = parsed.assumptions.join('\n');
      }

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

      // Determine status based on applicability
      const isApplicable = parsed.applicable !== false; // Default to true if not specified
      const status = isApplicable ? 'ia' : 'n/a';

      return {
        value: parsed.value,
        confidence: parsed.confidence || 'medium',
        conversation,
        sources: parsed.sources || [],
        calculationSteps: parsed.calculation_steps,
        caveats: parsed.caveats,
        status, // Add status field to result
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
      content: `Demande de raffinement : ${userMessage}\n\nVeuillez recalculer la valeur si nécessaire et répondre en JSON avec : { "applicable": true|false, "value": number, "confidence": "high"|"medium"|"low", "reasoning": string, "assumptions": string[], "calculation_steps": string[], "sources": string[], "caveats": string[] }\n\n**IMPORTANT** : \n1. Si l'indicateur n'est pas applicable, retournez {"applicable": false, "value": 0, "reasoning": "explication"}\n2. Sinon, dans le "reasoning", commencez TOUJOURS par annoncer la nouvelle valeur calculée. Par exemple : "J'ai calculé une nouvelle valeur de 150 pour cet indicateur. Voici pourquoi : ..."\n3. Dans le champ "assumptions" : retourne la liste COMPLÈTE et MISE À JOUR de TOUTES les hypothèses pertinentes pour cette intervention (pas seulement les nouvelles hypothèses). Intègre les nouvelles informations fournies par l'utilisateur dans cette liste complète.`,
    });

    // Debug logs (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('\n========== AI REFINE PROMPT DEBUG ==========');
      console.log(`Indicator: ${indicatorKey}`);
      console.log(`User message: ${userMessage}`);
      console.log('\n--- FULL CONVERSATION ---');
      messages.forEach((msg, idx) => {
        console.log(`\n[${idx}] ${msg.role.toUpperCase()}:`);
        console.log(msg.content);
      });
      console.log('\n============================================\n');
    }

    try {
      const response = await callGPT(messages);
      const cleanedResponse = cleanJsonResponse(response);
      const parsed = JSON.parse(cleanedResponse);

      // Debug logs (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('\n========== AI REFINE RESPONSE DEBUG ==========');
        console.log(`Indicator: ${indicatorKey}`);
        console.log('\n--- RAW RESPONSE ---');
        console.log(response);
        console.log('\n--- PARSED JSON ---');
        console.log(JSON.stringify(parsed, null, 2));
        console.log('==============================================\n');
      }

      // Store updated assumptions in intervention (replacing previous ones)
      if (parsed.assumptions && parsed.assumptions.length > 0) {
        intervention.assumptions = parsed.assumptions.join('\n');
      }

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

      // Determine status based on applicability
      const isApplicable = parsed.applicable !== false; // Default to true if not specified
      const status = isApplicable ? 'ia' : 'n/a';

      return {
        value: parsed.value,
        confidence: parsed.confidence || 'medium',
        conversation: updatedConversation,
        sources: parsed.sources || [],
        calculationSteps: parsed.calculation_steps,
        caveats: parsed.caveats,
        status, // Add status field to result
      };
    } catch (error: any) {
      throw new Error(`Failed to refine value: ${error.message}`);
    }
  }

  /**
   * Calculate all missing indicators in a system (stub for backward compatibility)
   * Use the overloaded version with options parameter instead
   * @param systemData - Full system data
   * @returns Summary of calculations
   */
  async calculateAllMissingLegacy(systemData: any): Promise<{
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
      
      case 'coutsPhytos':
        return this.buildContextualPrompt(COUTS_PHYTOS_PROMPT, context);
      
      case 'semences':
        return this.buildContextualPrompt(SEMENCES_PROMPT, context);
      
      case 'engrais':
        return this.buildContextualPrompt(ENGRAIS_PROMPT, context);
      
      case 'mecanisation':
        return this.buildContextualPrompt(MECANISATION_PROMPT, context);
      
      case 'gnr':
        return this.buildContextualPrompt(GNR_PROMPT, context);
      
      case 'irrigation':
        return this.buildContextualPrompt(IRRIGATION_PROMPT, context);
      
      case 'ift':
        return this.buildContextualPrompt(IFT_PROMPT, context);
      
      case 'eiq':
        return this.buildContextualPrompt(EIQ_PROMPT, context);
      
      case 'prixVente':
        // Special handling for prixVente: only applicable to harvest/moisson/fauche interventions
        const interventionName = context.intervention.name?.toLowerCase() || '';
        const interventionDesc = context.intervention.description?.toLowerCase() || '';
        const isHarvestRelated = 
          interventionName.includes('moisson') ||
          interventionName.includes('récolte') ||
          interventionName.includes('récolté') ||
          interventionName.includes('fauche') ||
          interventionName.includes('vendange') ||
          interventionDesc.includes('moisson') ||
          interventionDesc.includes('récolte') ||
          interventionDesc.includes('fauche') ||
          interventionDesc.includes('vendange');
        
        if (!isHarvestRelated) {
          // Return early with N/A result for non-harvest interventions
          return `Cette intervention n'est pas une récolte/moisson/fauche. Le prix de vente n'est applicable que pour les interventions de récolte. Réponds en JSON: {"value": "N/A", "confidence": "high", "assumptions": ["Intervention de type ${context.intervention.type}", "Pas de production à vendre"], "calculation_steps": ["Identification: intervention '${context.intervention.name}'", "Type: ${context.intervention.type}", "Conclusion: pas de récolte → prix de vente N/A"], "sources": [], "caveats": ["Le prix de vente ne s'applique qu'aux interventions de récolte/moisson/fauche"]}`;
        }
        
        return this.buildContextualPrompt(PRIX_VENTE_PROMPT, context);
      
      // Add more indicators as they are implemented
      default:
        // Fallback to generic prompt - use shared context builder
        const { intervention, step, systemData, systemAssumptions, stepAssumptions, interventionAssumptions } = context;

        // Build context section using shared utility
        const contextString = buildContextSection(
          systemAssumptions,
          step,
          stepAssumptions,
          interventionAssumptions,
          intervention
        );

        // Determine if this indicator should be per hectare
        const isPerHectare = 'frequence' != indicatorKey;
        
        return `${contextString}

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
      
      case 'coutsPhytos':
      case 'semences':
      case 'engrais':
      case 'mecanisation':
      case 'gnr':
      case 'irrigation':
        return `Tu es un expert en économie agricole française et en analyse des coûts de production. Réponds toujours en JSON valide.`;
      
      case 'ift':
        return `Tu es un expert en protection des cultures et en réglementation phytosanitaire française. Réponds toujours en JSON valide.`;
      
      case 'eiq':
        return `Tu es un expert en écotoxicologie agricole et en évaluation de l'impact environnemental des pesticides. Réponds toujours en JSON valide.`;
      
      case 'prixVente':
        return `Tu es un expert en économie agricole et en marchés des produits agricoles français. Réponds toujours en JSON valide.`;
      
      // Add more indicators as they are implemented
      default:
        // Determine if this indicator should be per hectare
       
        return `Tu es un assistant expert en agronomie française. Tu dois analyser les données agricoles et calculer des indicateurs avec précision.
        
**⚠️ RÈGLE CRITIQUE - CALCUL PAR HECTARE** : L'indicateur "${indicatorKey}" doit TOUJOURS être exprimé **PAR HECTARE**. Peu importe les données sources (totales, par parcelle, etc.), tu dois RAMENER le résultat final à l'hectare. Les unités attendues sont : €/ha, kg/ha, h/ha, kg CO2e/ha, uN/ha, qtx/ha selon l'indicateur.

Si tu disposes de :
- Valeurs totales pour une surface S : divise par S pour obtenir /ha
- Valeurs par parcelle de X ha : divise par X
- Valeurs en /100m² : multiplie par 100
- Valeurs en /are : multiplie par 100

Exemples :
- Coût total de semences 180 € pour 15 ha → 180/15 = 12 €/ha ✓
- Temps de travail 8h pour 20 ha → 8/20 = 0.4 h/ha ✓
- GES 150 kg pour 10 ha → 150/10 = 15 kg CO2e/ha ✓

Réponds toujours en JSON valide.`;
    }
  }

  /**
   * Build a contextual prompt by injecting context into a template
   * @param template - Prompt template with {context} placeholder
   * @param context - Context information
   * @returns Formatted prompt with context injected
   */
  private buildContextualPrompt(
    template: string,
    context: {
      intervention: any;
      step: any;
      systemData: any;
      systemAssumptions: string;
      stepAssumptions: string;
      interventionAssumptions: string;
    }
  ): string {
    const { intervention, step, systemAssumptions, stepAssumptions, interventionAssumptions } = context;

    // Use shared context builder from utils
    const contextString = buildContextSection(
      systemAssumptions,
      step,
      stepAssumptions,
      interventionAssumptions,
      intervention
    );

    // Replace {context} placeholder
    return template.replace('{context}', contextString);
  }

  /**
   * Calculate all missing indicators in batch with parallel execution
   * @param systemData - Complete system data
   * @param maxParallel - Maximum concurrent calculations (default: 5)
   * @param onProgress - Callback for progress updates
   * @returns Summary of calculations performed
   */
  async calculateAllMissing(
    systemData: any,
    options: {
      maxParallel?: number;
      onProgress?: (current: number, total: number, currentIndicator?: string, stepName?: string, interventionName?: string) => void;
      abortSignal?: AbortSignal;
    } = {}
  ): Promise<{
    systemData: any;
    calculatedCount: number;
    summary: Array<{
      stepIndex: number;
      interventionIndex: number;
      indicatorKey: string;
      value: number | null;
      confidence: ConfidenceLevel;
      error?: string;
    }>;
  }> {
    const { maxParallel = 5, onProgress, abortSignal } = options;
    
    // Find all missing indicators (null or undefined, reviewed=false)
    const missingIndicators: Array<{
      stepIndex: number;
      interventionIndex: number;
      indicatorKey: string;
    }> = [];

    const indicatorKeys = [
      'frequence', 'azoteMineral', 'azoteOrganique', 'ift', 'eiq', 'ges',
      'tempsTravail', 'coutsPhytos', 'semences', 'engrais', 'mecanisation',
      'gnr', 'irrigation', 'rendementTMS', 'prixVente'
    ];

    console.log('[calculateAllMissing] Starting detection...');
    console.log('[calculateAllMissing] systemData.steps:', systemData.steps?.length || 0, 'steps');

    systemData.steps?.forEach((step: any, stepIndex: number) => {
      console.log(`[calculateAllMissing] Step ${stepIndex}: ${step.interventions?.length || 0} interventions`);
      step.interventions?.forEach((intervention: any, interventionIndex: number) => {
        console.log(`[calculateAllMissing] Intervention ${stepIndex}-${interventionIndex}: ${intervention.name}`);
        console.log(`[calculateAllMissing] Values:`, intervention.values);
        
        indicatorKeys.forEach((indicatorKey) => {
          const valueEntry = intervention.values?.find((v: any) => v.key === indicatorKey);
          
          // Should calculate if:
          // - No value entry exists, OR
          // - Value is null/undefined, OR
          // - reviewed is not true and not "n/a"
          const needsCalculation = !valueEntry || 
            valueEntry.value === null || 
            valueEntry.value === undefined ||
            (valueEntry.reviewed !== true && valueEntry.reviewed !== "n/a");
          
          if (needsCalculation) {
            console.log(`[calculateAllMissing] ✓ Need to calculate ${indicatorKey}:`, {
              exists: !!valueEntry,
              value: valueEntry?.value,
              reviewed: valueEntry?.reviewed
            });
            missingIndicators.push({ stepIndex, interventionIndex, indicatorKey });
          }
        });
      });
    });

    console.log('[calculateAllMissing] Total missing indicators:', missingIndicators.length);

    const total = missingIndicators.length;
    const summary: Array<any> = [];
    let current = 0;

    console.log('[calculateAllMissing] Total to calculate:', total);
    console.log('[calculateAllMissing] Starting batch processing with maxParallel:', maxParallel);

    // Clone system data to avoid mutations
    const updatedSystemData = JSON.parse(JSON.stringify(systemData));

    // Process in batches
    for (let i = 0; i < missingIndicators.length; i += maxParallel) {
      // Check for abort
      if (abortSignal?.aborted) {
        console.log('[calculateAllMissing] Aborted by user');
        break;
      }

      const batch = missingIndicators.slice(i, i + maxParallel);
      console.log(`[calculateAllMissing] Processing batch ${Math.floor(i / maxParallel) + 1}/${Math.ceil(total / maxParallel)}: ${batch.length} indicators`);
      
      const batchPromises = batch.map(async ({ stepIndex, interventionIndex, indicatorKey }, batchIdx) => {
        try {
          // Get step and intervention names for progress display
          const stepName = updatedSystemData.steps[stepIndex]?.name || `Étape ${stepIndex + 1}`;
          const interventionName = updatedSystemData.steps[stepIndex]?.interventions[interventionIndex]?.name || `Intervention ${interventionIndex + 1}`;

          // Calculate current index for this item
          const itemCurrent = i + batchIdx + 1;

          // Report progress BEFORE starting calculation
          if (onProgress) {
            onProgress(itemCurrent, total, indicatorKey, stepName, interventionName);
          }

          const result = await this.calculateIndicator({
            systemData: updatedSystemData,
            stepIndex,
            interventionIndex,
            indicatorKey,
          });

          // Update system data
          const step = updatedSystemData.steps[stepIndex];
          const intervention = step.interventions[interventionIndex];
          
          if (!intervention.values) {
            intervention.values = [];
          }

          const existingIndex = intervention.values.findIndex((v: any) => v.key === indicatorKey);
          
          const valueEntry = {
            key: indicatorKey,
            value: result.value,
            confidence: result.confidence,
            reviewed: false,
            conversation: result.conversation,
          };

          if (existingIndex >= 0) {
            intervention.values[existingIndex] = valueEntry;
          } else {
            intervention.values.push(valueEntry);
          }

          current++;

          return {
            stepIndex,
            interventionIndex,
            indicatorKey,
            value: result.value,
            confidence: result.confidence,
          };
        } catch (error: any) {
          current++;

          return {
            stepIndex,
            interventionIndex,
            indicatorKey,
            value: null,
            confidence: 'low' as ConfidenceLevel,
            error: error.message || 'Calculation failed',
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      summary.push(...batchResults);
    }

    return {
      systemData: updatedSystemData,
      calculatedCount: summary.filter(s => !s.error).length,
      summary,
    };
  }
}

// Export singleton instance
export const indicatorCalculator = new IndicatorCalculator();
