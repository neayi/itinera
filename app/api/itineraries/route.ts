import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SystemWithFarm } from '@/lib/types';

export async function GET() {
  try {
    const systems = await query<SystemWithFarm>(`
      SELECT
        s.*,
        f.name as farm_name,
        f.farmer_name,
        f.town
      FROM systems s
      LEFT JOIN farms f ON s.farm_id = f.id
      ORDER BY s.updated_at DESC
    `);

    return NextResponse.json(systems);
  } catch (error) {
    console.error('Error fetching systems:', error);
    return NextResponse.json(
      { error: 'Failed to fetch systems' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { farm_id, name, description, system_type, productions, gps_location, json } = body;

    const result = await query(`
      INSERT INTO systems (farm_id, name, description, system_type, productions, gps_location, json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [farm_id, name, description, system_type, productions, gps_location, JSON.stringify(json)]);

    return NextResponse.json(
      { message: 'System created successfully', result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating system:', error);
    return NextResponse.json(
      { error: 'Failed to create system' },
      { status: 500 }
    );
  }
}