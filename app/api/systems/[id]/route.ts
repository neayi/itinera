import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { SystemWithFarm } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const system = await queryOne<SystemWithFarm>(`
      SELECT
        s.*,
        f.name as farm_name,
        f.farmer_name,
        f.gps_location as farm_gps_location,
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
