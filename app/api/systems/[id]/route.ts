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
    
    // Vérifier l'authentification
    const user = await getAuthUser(request);
    
    if (!user) {
      console.error("=== No user authenticated, returning 401");
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est propriétaire du système
    const systemRows = await query<{ user_id: number }>(
      'SELECT user_id FROM systems WHERE id = ?',
      [id]
    );

    if (systemRows.length === 0) {
      console.error("=== System not found, returning 404");
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      );
    }

    const system = systemRows[0];

    if (system.user_id !== user.userId) {
      console.error("=== User not owner, returning 403");
      return NextResponse.json(
        { error: 'Forbidden: You are not the owner of this system' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Mise à jour du champ JSON
    // Les totaux sont maintenant calculés côté client avant l'envoi
    // Le serveur ne fait plus que sauvegarder les données
    if (body.json) {
      await saveSystemTotals(id, body.json);
    }

    // Mise à jour des champs additionnels (name, gps_location, description)
    const updates: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      updates.push('name = ?');
      values.push(body.name);
    }

    if (body.gps_location !== undefined) {
      updates.push('gps_location = ?');
      values.push(body.gps_location);
    }

    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description);
    }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      values.push(id);
      await query(
        `UPDATE systems SET ${updates.join(', ')} WHERE id = ?`,
        values
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
