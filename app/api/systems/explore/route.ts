import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/app/api/auth/me/route';

interface ExploreSystem {
  id: number;
  name: string;
  description: string;
  system_type: string;
  productions: string;
  created_at: Date;
  updated_at: Date;
  town: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch systems from other users (excluding current user)
    const systems = await query<ExploreSystem>(`
      SELECT
        s.id,
        s.name,
        s.description,
        s.system_type,
        s.productions,
        s.created_at,
        s.updated_at,
        f.town
      FROM systems s
      LEFT JOIN farms f ON s.farm_id = f.id
      WHERE s.user_id != ?
      ORDER BY s.updated_at DESC
    `, [user.userId]);

    return NextResponse.json(systems);
  } catch (error) {
    console.error('Error fetching explore systems:', error);
    return NextResponse.json(
      { error: 'Failed to fetch systems' },
      { status: 500 }
    );
  }
}
