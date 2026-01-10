import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Mise à jour du champ JSON
    if (body.json) {
      await query(
        'UPDATE systems SET json = ?, updated_at = NOW() WHERE id = ?',
        [JSON.stringify(body.json), id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating system:', error);
    return NextResponse.json(
      { error: 'Failed to update system' },
      { status: 500 }
    );
  }
}
