import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { SystemWithFarm } from '@/lib/types';
import { saveSystemTotals } from '@/lib/persist-system';
import { getAuthUser } from '@/app/api/auth/me/route';

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.error("=== PATCH System ID:", id);

    // Vérifier l'authentification
    const user = await getAuthUser(request);
    console.error("=== User from auth:", JSON.stringify(user));
    
    if (!user) {
      console.error("=== No user authenticated, returning 401");
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est propriétaire du système
    const systemRows = await query<any[]>(
      'SELECT user_id FROM systems WHERE id = ?',
      [id]
    );

    console.error("=== System rows:", JSON.stringify(systemRows));

    if (systemRows.length === 0) {
      console.error("=== System not found, returning 404");
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      );
    }

    const system = systemRows[0];
    console.error("=== System user_id:", system.user_id, "Authenticated user_id:", user.userId);
    console.error("=== Comparison:", system.user_id !== user.userId ? "DIFFERENT - will reject" : "SAME - will allow");
    
    if (system.user_id !== user.userId) {
      console.error("=== User not owner, returning 403");
      return NextResponse.json(
        { error: 'Forbidden: You are not the owner of this system' },
        { status: 403 }
      );
    }
    
    console.error("=== Authorization successful, proceeding with update");
    
    const body = await request.json();

    // Mise à jour du champ JSON
    // Les totaux sont maintenant calculés côté client avant l'envoi
    // Le serveur ne fait plus que sauvegarder les données
    if (body.json) {
      await saveSystemTotals(id, body.json);
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
