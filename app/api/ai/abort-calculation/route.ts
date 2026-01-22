import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { processLogId } = body;

    console.log('[abort-calculation] Aborting process:', processLogId);

    if (!processLogId) {
      return NextResponse.json(
        { message: 'processLogId requis' },
        { status: 400 }
      );
    }

    // Update process status to 'aborted'
    await query(
      'UPDATE ai_process_log SET status = ?, end = NOW() WHERE id = ? AND status = ?',
      ['aborted', processLogId, 'started']
    );

    console.log('[abort-calculation] Process marked as aborted:', processLogId);

    return NextResponse.json({
      success: true,
      message: 'Calcul en cours d\'interruption'
    });
  } catch (error: any) {
    console.error('[abort-calculation] Error:', error);
    return NextResponse.json(
      {
        message: 'Erreur lors de l\'interruption du calcul',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
