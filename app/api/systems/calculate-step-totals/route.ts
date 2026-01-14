import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { calculateAndSaveStepTotals } from '@/lib/calculate-step-totals';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { systemId } = body;

    if (!systemId) {
      return NextResponse.json(
        { success: false, message: 'Missing systemId' },
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
        { success: false, message: 'System not found' },
        { status: 404 }
      );
    }

    let systemData = system.json;
    if (typeof systemData === 'string') {
      systemData = JSON.parse(systemData);
    }

    // Calculate and save step totals
    const updatedSystemData = await calculateAndSaveStepTotals(systemId, systemData);

    return NextResponse.json({
      success: true,
      message: 'Step totals calculated and saved',
      systemData: updatedSystemData,
    });

  } catch (error: any) {
    console.error('[calculate-step-totals] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
