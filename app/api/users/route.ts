import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { User } from '@/lib/types';

export async function GET() {
  try {
    const users = await query<User>(`
      SELECT * FROM users
      ORDER BY created_at DESC
    `);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    const result = await query(`
      INSERT INTO users (name, email)
      VALUES (?, ?)
    `, [name, email]);

    return NextResponse.json(
      { message: 'User created successfully', result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
