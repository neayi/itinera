import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/url-helpers';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  // Supprimer le cookie de session
  response.cookies.delete('auth_token');

  return response;
}

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL('/logout.html', getBaseUrl(request))
  );

  // Supprimer le cookie de session
  response.cookies.delete('auth_token');

  return response;
}
