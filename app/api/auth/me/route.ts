import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export interface AuthUser {
  userId: number;
  email: string;
  name: string;
  username: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.SESSION_SECRET || 'default_secret_change_me'
    );

    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as number,
      email: payload.email as string,
      name: payload.name as string,
      username: payload.username as string,
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
