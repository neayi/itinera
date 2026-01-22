import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/url-helpers';

/**
 * Route de compatibilité pour Discourse
 * Discourse redirige vers /session/sso_login au lieu d'utiliser notre return_sso_url
 * Cette route redirige simplement vers notre vrai callback
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Récupérer tous les paramètres
  const sso = searchParams.get('sso');
  const sig = searchParams.get('sig');

  if (!sso || !sig) {
    console.error('[SSO Compat] Missing SSO parameters, redirecting to logout');
    return NextResponse.redirect(new URL('/logout.html', getBaseUrl(request)));
  }

  // Rediriger vers notre vrai callback en préservant tous les paramètres
  const callbackUrl = new URL('/api/auth/callback', getBaseUrl(request));
  callbackUrl.searchParams.set('sso', sso);
  callbackUrl.searchParams.set('sig', sig);

  console.log('[SSO Compat] Redirecting to actual callback:', callbackUrl.toString());

  return NextResponse.redirect(callbackUrl);
}
