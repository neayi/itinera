import { NextRequest, NextResponse } from 'next/server';
import { validateDiscourseSSO } from '@/lib/discourse-sso';
import { findOrCreateUser } from '@/lib/user';
import { getBaseUrl } from '@/lib/url-helpers';
import { SignJWT } from 'jose';

async function generateToken(userId: number, email: string, name: string, username: string): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.SESSION_SECRET || 'default_secret_change_me'
  );

  const token = await new SignJWT({ userId, email, name, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return token;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sso = searchParams.get('sso');
  const sig = searchParams.get('sig');
  const returnUrl = searchParams.get('return_url') || '/';

  console.log('[SSO Callback] Received SSO callback');
  console.log('[SSO Callback] SSO param length:', sso?.length);
  console.log('[SSO Callback] Signature:', sig);
  console.log('[SSO Callback] SSO Secret configured:', !!process.env.DISCOURSE_SSO_SECRET);

  if (!sso || !sig) {
    console.error('[SSO Callback] Missing SSO or signature parameters');
    return NextResponse.redirect(
      new URL('/logout.html', getBaseUrl(request))
    );
  }

  try {
    // Valider le SSO
    const payload = validateDiscourseSSO(sso, sig);

    if (!payload) {
      console.error('[SSO Callback] Invalid SSO payload - validation failed');
      return NextResponse.redirect(
        new URL('/logout.html', getBaseUrl(request))
      );
    }

    console.log('[SSO Callback] Valid payload received:', {
      external_id: payload.external_id,
      email: payload.email,
      username: payload.username,
      name: payload.name
    });

    // Créer ou mettre à jour l'utilisateur
    console.log('[SSO Callback] Creating/updating user in database...');
    const user = await findOrCreateUser(
      payload.external_id,
      payload.email,
      payload.username || payload.email.split('@')[0],
      payload.name || payload.username || payload.email.split('@')[0]
    );

    console.log('[SSO Callback] User created/updated:', { id: user.id, email: user.email, name: user.name });

    // Générer un token JWT
    const token = await generateToken(user.id, user.email, user.name, user.username);
    console.log('[SSO Callback] JWT token generated, length:', token.length);

    // Créer la réponse avec redirection
    const response = NextResponse.redirect(
      new URL(returnUrl, getBaseUrl(request))
    );

    // Définir le cookie de session
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    });

    console.log('[SSO Callback] Cookie set, redirecting to:', returnUrl);
    return response;
  } catch (error) {
    console.error('Error during SSO callback:', error);
    return NextResponse.redirect(
      new URL('/logout.html', getBaseUrl(request))
    );
  }
}
