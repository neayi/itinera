import { NextRequest, NextResponse } from 'next/server';
import { indicatorCalculator } from '@/lib/ai/indicator-calculator';
import { queryOne, query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { systemId } = body;

    console.log('[calculate-all-missing] Request received for systemId:', systemId);

    if (!systemId) {
      return NextResponse.json(
        { message: 'systemId requis' },
        { status: 400 }
      );
    }

    // Fetch system data from database
    const system = await queryOne(
      'SELECT id, name, json FROM systems WHERE id = ?',
      [systemId]
    );

    console.log('[calculate-all-missing] System found:', !!system);

    if (!system) {
      return NextResponse.json(
        { message: 'Système non trouvé' },
        { status: 404 }
      );
    }

    // Parse JSON if it's a string
    let systemData = system.json;
    if (typeof systemData === 'string') {
      console.log('[calculate-all-missing] systemData is a string, parsing...');
      systemData = JSON.parse(systemData);
    }
    
    console.log('[calculate-all-missing] systemData type:', typeof systemData);
    console.log('[calculate-all-missing] systemData.steps:', systemData?.steps?.length || 'undefined');

    // Progress tracking
    let progressData = { current: 0, total: 0, currentIndicator: '' };

    const result = await indicatorCalculator.calculateAllMissing(systemData, {
      maxParallel: 5,
      onProgress: (current, total, currentIndicator) => {
        progressData = { current, total, currentIndicator: currentIndicator || '' };
        // In a real implementation, we'd use WebSocket or SSE for real-time updates
        // For now, this just tracks progress internally
      },
    });

    // Update database with calculated values
    await query(
      'UPDATE systems SET json = ? WHERE id = ?',
      [JSON.stringify(result.systemData), systemId]
    );

    return NextResponse.json({
      success: true,
      calculatedCount: result.calculatedCount,
      total: result.summary.length,
      summary: result.summary,
      updatedSystemData: result.systemData,
    });
  } catch (error: any) {
    console.error('Error calculating all missing indicators:', error);
    return NextResponse.json(
      {
        message: 'Erreur lors du calcul des indicateurs',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
