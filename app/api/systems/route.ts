import { NextRequest, NextResponse } from 'next/server';
import { SystemWithFarmDTO } from '@/shared/system-with-farm/system-with-farm.dto';
import { getUserSystemsWithFarms } from '@/lib/read/systemWithFarm.read';
import { SystemService, MySQLSystemRepository } from '@/lib/domain/system';
import { getAuthUser } from '@/app/api/auth/me/route';

const systemService = new SystemService(new MySQLSystemRepository());

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const systems = await getUserSystemsWithFarms(user.userId);

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
    
    // Utiliser le service pour créer le système
    const systemId = await systemService.createSystem({
      ...body,
      user_id: user.userId
    });

    return NextResponse.json(
      { message: 'System created successfully', id: systemId },
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
