import { NextRequest } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { indicatorCalculator } from '@/lib/ai/indicator-calculator';
import { calculateAndSaveSystemTotals } from '@/lib/persist-system';

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
      const { systemId } = body;

      console.log('[calculate-all-missing-stream] Starting for systemId:', systemId);

      if (!systemId) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Missing systemId' })}\n\n`));
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

      // Calculate all missing with progress callback
      const result = await indicatorCalculator.calculateAllMissing(systemData, {
        maxParallel: 10, // Increased from 5 to 10 for faster processing
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
          await writer.write(encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`));
        }
      });

      console.log('[calculate-all-missing-stream] Calculation complete, updating database...');

      // Calculate and save step totals
      const finalSystemData = await calculateAndSaveSystemTotals(systemId, result.systemData);

      // Send completion event
      const completionData = {
        type: 'complete',
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
