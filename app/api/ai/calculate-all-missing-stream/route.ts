import { NextRequest } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { indicatorCalculator } from '@/lib/ai/indicator-calculator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  // Create a TransformStream for SSE
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Start processing in background
  (async () => {
    try {
      const body = await request.json();
      const { systemId, processLogId, userId, recalculateAll } = body;

      console.log('[calculate-all-missing-stream] Starting for systemId:', systemId, 'processLogId:', processLogId, 'userId:', userId, 'recalculateAll:', recalculateAll);

      if (!systemId) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Missing systemId' })}\n\n`));
        await writer.close();
        return;
      }

      if (!processLogId) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Missing processLogId' })}\n\n`));
        await writer.close();
        return;
      }

      // Fetch system from database
      const system = await queryOne<any>(
        'SELECT * FROM systems WHERE id = ?',
        [systemId]
      );

      if (!system) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'System not found' })}\n\n`));
        await writer.close();
        return;
      }

      let systemData = system.json;
      if (typeof systemData === 'string') {
        systemData = JSON.parse(systemData);
      }

      console.log('[calculate-all-missing-stream] System data loaded, steps:', systemData?.steps?.length);

      // Calculate all missing with progress callback (using existing processLogId)
      const result = await indicatorCalculator.calculateAllMissing(systemData, {
        systemId,
        processLogId, // Use existing processLogId from prepare step
        userId,
        recalculateAll: recalculateAll || false,
        onProcessStarted: async (processLogId) => {
          // Send started event with processLogId
          const startedData = {
            type: 'started',
            processLogId
          };
          console.log('[calculate-all-missing-stream] Process started:', processLogId);
          try {
            await writer.write(encoder.encode(`data: ${JSON.stringify(startedData)}\n\n`));
          } catch (error) {
            console.log('[calculate-all-missing-stream] Error writing started event, client likely disconnected');
          }
        },
        onProgress: async (current, total, currentIndicator, stepName, interventionName) => {
          // Send progress event
          const progressData = {
            type: 'progress',
            current,
            total,
            currentIndicator,
            stepName,
            interventionName,
            percentage: Math.round((current / total) * 100)
          };
          console.log(`[calculate-all-missing-stream] Progress: ${current}/${total} - ${stepName} / ${interventionName} / ${currentIndicator}`);

          try {
            await writer.write(encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`));
          } catch (error) {
            console.log('[calculate-all-missing-stream] Error writing progress, client likely disconnected');
          }
        }
      });

      console.log('[calculate-all-missing-stream] Calculation complete (system totals already calculated and saved)');

      // Send completion event with processLogId
      const completionData = {
        type: 'complete',
        processLogId: result.processLogId,
        calculatedCount: result.calculatedCount,
        total: result.summary.length,
        summary: result.summary
      };
      await writer.write(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`));

      console.log('[calculate-all-missing-stream] Stream complete');

    } catch (error) {
      console.error('[calculate-all-missing-stream] Error:', error);
      const errorData = {
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
      await writer.write(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
    } finally {
      await writer.close();
    }
  })();

  // Return streaming response
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
