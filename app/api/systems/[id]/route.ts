import { NextRequest, NextResponse } from 'next/server';
import { SystemService, MySQLSystemRepository } from '@/lib/domain/system';
import { getSystemWithFarm } from '@/lib/read/systemWithFarm.read';
import { getAuthUser } from '@/app/api/auth/me/route';

const systemService = new SystemService(new MySQLSystemRepository());

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Utiliser la lecture avec jointure pour obtenir les données de la ferme
    const system = await getSystemWithFarm(id);

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
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Mise à jour via le service
    await systemService.updateSystem(id, user.userId, body);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating system:', error);
    
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update system' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    await systemService.deleteSystem(id, user.userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting system:', error);
    
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete system' },
      { status: 500 }
    );
  }
}
