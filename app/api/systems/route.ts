import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SystemWithFarm } from '@/lib/types';
import { getAuthUser } from '@/app/api/auth/me/route';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const systems = await query<SystemWithFarm>(`
      SELECT
        s.id,
        s.farm_id,
        s.user_id,
        s.name,
        s.description,
        s.system_type,
        s.productions,
        s.eiq,
        s.gross_margin,
        s.duration,
        s.created_at,
        s.updated_at,
        f.name as farm_name,
        f.farmer_name,
        f.town
      FROM systems s
      LEFT JOIN farms f ON s.farm_id = f.id
      WHERE s.user_id = ?
      ORDER BY s.updated_at DESC
    `, [user.userId]);

    return NextResponse.json(systems);
  } catch (error) {
    console.error('Error fetching systems:', error);
    return NextResponse.json(
      { error: 'Failed to fetch systems' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      farm_id,
      name,
      description,
      system_type,
      productions,
      gps_location,
      json
    } = body;

    const result = await query(`
      INSERT INTO systems (farm_id, user_id, name, description, system_type, productions, gps_location, json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [farm_id, user.userId, name, description, system_type, productions, gps_location, JSON.stringify(json)]);

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
