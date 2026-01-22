import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getBaseUrl } from './lib/url-helpers';

const PUBLIC_PATHS = ['/logout.html', '/api/auth/login', '/api/auth/callback', '/api/health', '/session/sso_login'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Autoriser les chemins publics
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Autoriser les ressources statiques
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/css') ||
    pathname.startsWith('/js') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Vérifier le token d'authentification
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/logout.html', getBaseUrl(request)));
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.SESSION_SECRET || 'default_secret_change_me'
    );

    await jwtVerify(token, secret);

    return NextResponse.next();
  } catch (error) {
    console.error('Invalid token:', error);
    const response = NextResponse.redirect(new URL('/logout.html', getBaseUrl(request)));
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
