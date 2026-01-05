import { NextRequest, NextResponse } from 'next/server';
import { generateDiscourseSSO } from '@/lib/discourse-sso';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const returnUrl = searchParams.get('return_url') || '/';

  // Générer un nonce aléatoire
  const nonce = crypto.randomBytes(16).toString('hex');

  try {
    // Générer l'URL SSO
    const ssoUrl = generateDiscourseSSO(nonce, returnUrl);

    // Rediriger vers Discourse pour l'authentification
    return NextResponse.redirect(ssoUrl);
  } catch (error) {
    console.error('Error generating SSO URL:', error);
    return NextResponse.json(
      { error: 'Failed to initiate SSO' },
      { status: 500 }
    );
  }
}
