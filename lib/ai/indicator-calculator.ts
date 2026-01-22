// Base Indicator Calculator Class
import { callGPT } from './openai-client';
import { CalculationContext, CalculationResult, ConversationMessage, ConfidenceLevel } from '../types';
import { IndicatorFactory, AI_CALCULABLE_INDICATORS } from './indicators';
import { query } from '../db';
import { calculateAndSaveSystemTotals } from '../persist-system';

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
   * Create a log entry for AI process tracking
   */
  private async createProcessLog(
    systemId: string,
    intervention: string,
    indicator: string,
    totalIndicators?: number,
    userId?: number
  ): Promise<number> {
    const result = await query(
      'INSERT INTO ai_process_log (system_id, intervention, indicator, user_id, start, status, total_indicators, processed_indicators) VALUES (?, ?, ?, ?, NOW(), "started", ?, 0)',
      [systemId, intervention, indicator, userId || null, totalIndicators || null]
    );
    return (result as any).insertId;
  }

  /**
   * Update log entry status
   */
  private async updateProcessLog(
    logId: number,
    status: 'completed' | 'failed' | 'aborted',
    errorMessage?: string
  ): Promise<void> {
    await query(
      'UPDATE ai_process_log SET status = ?, end = NOW(), error_message = ? WHERE id = ?',
      [status, errorMessage || null, logId]
    );
  }

  /**
   * Update processed indicators count
   */
  private async updateProcessedCount(
    logId: number,
    processedCount: number
  ): Promise<void> {
    await query(
      'UPDATE ai_process_log SET processed_indicators = ? WHERE id = ?',
      [processedCount, logId]
    );
  }

  /**
   * Check if process has been aborted
   */
  private async isProcessAborted(logId: number): Promise<boolean> {
    const result = await query(
      'SELECT status FROM ai_process_log WHERE id = ?',
      [logId]
    );
    return result.length > 0 && result[0].status === 'aborted';
  }

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

    // Create indicator instance using factory
    const indicator = IndicatorFactory.create(indicatorKey, {
      systemData,
      stepIndex,
      interventionIndex,
    });

    // Get prompts from indicator instance (no context needed - all extracted from class properties)
    const systemMessage = indicator.getSystemPrompt();
    const prompt = indicator.getPrompt();

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

      // Store updated assumptions in intervention as array (replacing previous ones)
      if (parsed.assumptions && parsed.assumptions.length > 0) {
        intervention.assumptions = parsed.assumptions;
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

      // Store updated assumptions in intervention as array (replacing previous ones)
      if (parsed.assumptions && parsed.assumptions.length > 0) {
        intervention.assumptions = parsed.assumptions;
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
   * Calculate all missing indicators sequentially with DB persistence after each calculation
   * @param systemData - Complete system data
   * @param systemId - System ID for DB persistence (required)
   * @param onProgress - Callback for progress updates
   * @returns Summary of calculations performed
   */
  async calculateAllMissing(
    systemData: any,
    options: {
      systemId: string;
      processLogId?: number;
      userId?: number;
      recalculateAll?: boolean;
      onProcessStarted?: (processLogId: number) => void;
      onProgress?: (current: number, total: number, currentIndicator?: string, stepName?: string, interventionName?: string) => void;
    }
  ): Promise<{
    processLogId: number;
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
    const { systemId, processLogId: existingProcessLogId, userId, recalculateAll, onProcessStarted, onProgress } = options;

    // Find all missing indicators
    // If recalculateAll = false: only those without value (null/undefined)
    // If recalculateAll = true: those without value OR status != "user"
    const missingIndicators: Array<{
      stepIndex: number;
      interventionIndex: number;
      indicatorKey: string;
    }> = [];

    // Use indicators that can be calculated by AI (defined in indicator-factory.ts)
    const indicatorKeys = AI_CALCULABLE_INDICATORS;

    console.log('[calculateAllMissing] Starting detection... recalculateAll:', recalculateAll);
    console.log('[calculateAllMissing] systemData.steps:', systemData.steps?.length || 0, 'steps');

    systemData.steps?.forEach((step: any, stepIndex: number) => {
      console.log(`[calculateAllMissing] Step ${stepIndex}: ${step.interventions?.length || 0} interventions`);
      step.interventions?.forEach((intervention: any, interventionIndex: number) => {
        console.log(`[calculateAllMissing] Intervention ${stepIndex}-${interventionIndex}: ${intervention.name}`);
        console.log(`[calculateAllMissing] Values:`, intervention.values);

        indicatorKeys.forEach((indicatorKey) => {
          const valueEntry = intervention.values?.find((v: any) => v.key === indicatorKey);

          const hasNoValue = !valueEntry || valueEntry.value === null || valueEntry.value === undefined;

          // Logic depends on recalculateAll option
          const needsCalculation = recalculateAll
            ? (hasNoValue || valueEntry.status !== "user")  // Recalculate all: include existing values with status != "user"
            : hasNoValue;  // Default: only without value

          if (needsCalculation) {
            console.log(`[calculateAllMissing] ✓ Need to calculate ${indicatorKey}:`, {
              exists: !!valueEntry,
              value: valueEntry?.value,
              recalculateAll
            });
            missingIndicators.push({ stepIndex, interventionIndex, indicatorKey });
          }
        });
      });
    });

    console.log('[calculateAllMissing] Total missing indicators:', missingIndicators.length);

    const total = missingIndicators.length;

    // Use existing processLogId or create a new one
    let processLogId: number;
    if (existingProcessLogId) {
      processLogId = existingProcessLogId;
      console.log('[calculateAllMissing] Using existing process log:', processLogId);
      // Update total_indicators and user_id if needed
      await query(
        'UPDATE ai_process_log SET total_indicators = ?, user_id = ? WHERE id = ?',
        [total, userId, processLogId]
      );
    } else {
      // Create process log entry with total count
      processLogId = await this.createProcessLog(systemId, 'all', 'all', total, userId);
      console.log('[calculateAllMissing] Created process log:', processLogId, 'with total:', total);
    }

    // Notify that process has started with its ID
    if (onProcessStarted) {
      await onProcessStarted(processLogId);
    }

    const summary: Array<any> = [];
    let current = 0;

    console.log('[calculateAllMissing] Total to calculate:', total);
    console.log('[calculateAllMissing] Starting SEQUENTIAL processing (no parallel execution)');

    // Clone system data to work with
    let updatedSystemData = JSON.parse(JSON.stringify(systemData));

    // Track if calculation was interrupted
    let wasInterrupted = false;

    // Process indicators one by one sequentially
    for (let i = 0; i < missingIndicators.length; i++) {
      // Check for abort in database
      const isAborted = await this.isProcessAborted(processLogId);
      if (isAborted) {
        console.log('[calculateAllMissing] Aborted by user (checked in DB)');
        wasInterrupted = true;
        await this.updateProcessLog(processLogId, 'aborted');
        break;
      }

      const { stepIndex, interventionIndex, indicatorKey } = missingIndicators[i];

      try {
        // Get step and intervention names for progress display
        const stepName = updatedSystemData.steps[stepIndex]?.name || `Étape ${stepIndex + 1}`;
        const interventionName = updatedSystemData.steps[stepIndex]?.interventions[interventionIndex]?.name || `Intervention ${interventionIndex + 1}`;

        // Report progress BEFORE starting calculation
        console.log(`[calculateAllMissing] [${i + 1}/${total}] Calculating ${indicatorKey} for ${stepName} / ${interventionName}`);
        if (onProgress) {
          onProgress(i + 1, total, indicatorKey, stepName, interventionName);
        }

        const result = await this.calculateIndicator({
          systemData: updatedSystemData,
          stepIndex,
          interventionIndex,
          indicatorKey,
        });

        // Update system data in memory
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
          status: 'ia',
          conversation: result.conversation,
        };

        if (existingIndex >= 0) {
          intervention.values[existingIndex] = valueEntry;
        } else {
          intervention.values.push(valueEntry);
        }

        // Save to DB immediately after each successful calculation
        console.log(`[calculateAllMissing] [${i + 1}/${total}] Saving to DB...`);
        await query(
          'UPDATE systems SET json = ? WHERE id = ?',
          [JSON.stringify(updatedSystemData), systemId]
        );
        console.log(`[calculateAllMissing] [${i + 1}/${total}] ✓ Saved successfully`);

        current++;

        // Update processed count in log
        await this.updateProcessedCount(processLogId, current);

        summary.push({
          stepIndex,
          interventionIndex,
          indicatorKey,
          value: result.value,
          confidence: result.confidence,
        });
      } catch (error: any) {
        console.error(`[calculateAllMissing] [${i + 1}/${total}] ✗ Error calculating ${indicatorKey}:`, error.message);
        current++;

        summary.push({
          stepIndex,
          interventionIndex,
          indicatorKey,
          value: null,
          confidence: 'low' as ConfidenceLevel,
          error: error.message || 'Calculation failed',
        });
      }
    }

    // If interrupted, reload latest data from DB (includes all calculations done before interruption)
    if (wasInterrupted) {
      console.log('[calculateAllMissing] Interrupted - reloading latest data from DB...');
      const latestSystem = await query(
        'SELECT json FROM systems WHERE id = ?',
        [systemId]
      );

      if (latestSystem && latestSystem.length > 0) {
        let latestSystemData = latestSystem[0].json;
        if (typeof latestSystemData === 'string') {
          latestSystemData = JSON.parse(latestSystemData);
        }
        updatedSystemData = latestSystemData;
      }
      console.log('[calculateAllMissing] ✓ Latest data reloaded');
    }

    // Calculate system totals and save everything (JSON + eiq, gross_margin, duration columns)
    console.log('[calculateAllMissing] Calculating system totals and saving final data...');
    const finalSystemData = await calculateAndSaveSystemTotals(systemId, updatedSystemData);
    console.log('[calculateAllMissing] ✓ System totals calculated and saved');

    // Update process log with final status
    const finalStatus = wasInterrupted ? 'aborted' : 'completed';
    await this.updateProcessLog(processLogId, finalStatus);
    console.log(`[calculateAllMissing] Process log updated to: ${finalStatus}`);

    return {
      processLogId,
      systemData: finalSystemData,
      calculatedCount: summary.filter(s => !s.error).length,
      summary,
    };
  }
}

// Export singleton instance
export const indicatorCalculator = new IndicatorCalculator();
