import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { FarmDTO } from '@/shared/farm/farm.dto';

export async function GET() {
  try {
    const farms = await query<FarmDTO>(`
      SELECT * FROM farms
      ORDER BY updated_at DESC
    `);

    return NextResponse.json(farms);
  } catch (error) {
    console.error('Error fetching farms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farms' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, farmer_name } = body;

    const result = await query(`
      INSERT INTO farms (name, farmer_name)
      VALUES (?, ?)
    `, [name, farmer_name]);

    return NextResponse.json(
      { message: 'Farm created successfully', result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating farm:', error);
    return NextResponse.json(
      { error: 'Failed to create farm' },
      { status: 500 }
    );
  }
}
