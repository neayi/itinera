import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/logout.html', '/api/auth/login', '/api/auth/callback', '/api/health', '/session/sso_login'];

/**
 * Get the base URL for the application (handles proxy/Traefik scenarios)
 */
function getBaseUrl(request: NextRequest): string {
  // Priority 1: Environment variables
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.APP_URL) return process.env.APP_URL;

  // Priority 2: Forwarded headers (from proxy like Traefik)
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  // Fallback: request URL (won't work correctly behind proxy)
  return new URL(request.url).origin;
}

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
