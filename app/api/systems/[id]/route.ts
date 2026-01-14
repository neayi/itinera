import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { SystemWithFarm } from '@/lib/types';
import { calculateAndSaveStepTotals } from '@/lib/calculate-step-totals';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const system = await queryOne<SystemWithFarm>(`
      SELECT
        s.id,
        s.farm_id,
        s.user_id,
        s.name,
        s.description,
        s.system_type,
        s.productions,
        COALESCE(s.gps_location, f.gps_location) as gps_location,
        s.json,
        s.created_at,
        s.updated_at,
        f.name as farm_name,
        f.farmer_name,
        f.town
      FROM systems s
      LEFT JOIN farms f ON s.farm_id = f.id
      WHERE s.id = ?
    `, [id]);

    if (!system) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(system);
  } catch (error) {
    console.error('Error fetching system:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Mise à jour du champ JSON
    if (body.json) {
      // Calculate and save step totals automatically
      await calculateAndSaveStepTotals(id, body.json);
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
