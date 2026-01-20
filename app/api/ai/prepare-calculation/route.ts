import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { AI_CALCULABLE_INDICATORS } from '@/lib/ai/indicators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { systemId, userId } = body;

    console.log('[prepare-calculation] Preparing calculation for systemId:', systemId);

    if (!systemId) {
      return NextResponse.json(
        { message: 'systemId requis' },
        { status: 400 }
      );
    }

    // Fetch system from database
    const system = await queryOne<any>(
      'SELECT * FROM systems WHERE id = ?',
      [systemId]
    );

    if (!system) {
      return NextResponse.json(
        { message: 'System not found' },
        { status: 404 }
      );
    }

    let systemData = system.json;
    if (typeof systemData === 'string') {
      systemData = JSON.parse(systemData);
    }

    // Detect missing indicators in two categories:
    // 1. Without value: no value at all (null/undefined)
    // 2. All calculable: without value OR status != "user"
    const indicatorsWithoutValue: Array<{
      stepIndex: number;
      interventionIndex: number;
      indicatorKey: string;
    }> = [];
    
    const allCalculableIndicators: Array<{
      stepIndex: number;
      interventionIndex: number;
      indicatorKey: string;
    }> = [];

    const indicatorKeys = AI_CALCULABLE_INDICATORS;

    systemData.steps?.forEach((step: any, stepIndex: number) => {
      step.interventions?.forEach((intervention: any, interventionIndex: number) => {
        indicatorKeys.forEach((indicatorKey) => {
          const valueEntry = intervention.values?.find((v: any) => v.key === indicatorKey);
          const hasNoValue = !valueEntry || valueEntry.value === null || valueEntry.value === undefined;
          const needsCalculation = hasNoValue || valueEntry.status !== "user";

          if (hasNoValue) {
            indicatorsWithoutValue.push({ stepIndex, interventionIndex, indicatorKey });
          }
          
          if (needsCalculation) {
            allCalculableIndicators.push({ stepIndex, interventionIndex, indicatorKey });
          }
        });
      });
    });

    const indicatorsWithoutValueCount = indicatorsWithoutValue.length;
    const totalCalculableCount = allCalculableIndicators.length;

    console.log('[prepare-calculation] Indicators without value:', indicatorsWithoutValueCount);
    console.log('[prepare-calculation] Total calculable indicators:', totalCalculableCount);

    // Calculate estimated time based on recent executions
    const recentLogs = await query(
      `SELECT
        TIMESTAMPDIFF(SECOND, start, end) as duration_seconds,
        processed_indicators
       FROM ai_process_log
       WHERE indicator = 'all'
         AND end IS NOT NULL
         AND processed_indicators > 0
       ORDER BY start DESC
       LIMIT 5`
    );

    let avgSecondsPerIndicator = 4; // Default: 4 seconds per indicator

    if (recentLogs.length > 0) {
      const totalDuration = recentLogs.reduce((sum: number, log: any) => sum + (log.duration_seconds || 0), 0);
      const totalProcessed = recentLogs.reduce((sum: number, log: any) => sum + (log.processed_indicators || 0), 0);

      if (totalProcessed > 0) {
        avgSecondsPerIndicator = totalDuration / totalProcessed;
        console.log('[prepare-calculation] Calculated avg time from recent logs:', avgSecondsPerIndicator, 'seconds per indicator');
      }
    }

    // By default, estimate based on indicators without value
    const estimatedSeconds = Math.ceil(indicatorsWithoutValueCount * avgSecondsPerIndicator);
    const estimatedSecondsAll = Math.ceil(totalCalculableCount * avgSecondsPerIndicator);

    // Create process log entry (with default count = without value)
    const result = await query(
      'INSERT INTO ai_process_log (system_id, intervention, indicator, user_id, start, status, total_indicators, processed_indicators) VALUES (?, ?, ?, ?, NOW(), "started", ?, 0)',
      [systemId, 'all', 'all', userId || null, indicatorsWithoutValueCount]
    );

    const processLogId = (result as any).insertId;

    console.log('[prepare-calculation] Created process log:', processLogId, 'with estimated time:', estimatedSeconds, 'seconds');

    return NextResponse.json({
      success: true,
      processLogId,
      indicatorsWithoutValue: indicatorsWithoutValueCount,
      totalCalculableIndicators: totalCalculableCount,
      estimatedSeconds,
      estimatedSecondsAll,
      avgSecondsPerIndicator: Math.round(avgSecondsPerIndicator * 10) / 10
    });
  } catch (error: any) {
    console.error('[prepare-calculation] Error:', error);
    return NextResponse.json(
      {
        message: 'Erreur lors de la préparation du calcul',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
