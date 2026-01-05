import crypto from 'crypto';

export interface DiscoursePayload {
  nonce: string;
  external_id: string;
  email: string;
  username?: string;
  name?: string;
}

export function generateDiscourseSSO(nonce: string, returnUrl: string = '/'): string {
  const ssoSecret = process.env.DISCOURSE_SSO_SECRET;
  const ssoUrl = process.env.DISCOURSE_SSO_URL;

  if (!ssoSecret || !ssoUrl) {
    throw new Error('DISCOURSE_SSO_SECRET and DISCOURSE_SSO_URL must be configured');
  }

  const payload = `nonce=${nonce}&return_sso_url=${encodeURIComponent(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?return_url=${encodeURIComponent(returnUrl)}`
  )}`;

  const encodedPayload = Buffer.from(payload).toString('base64');
  const hmac = crypto.createHmac('sha256', ssoSecret);
  const signature = hmac.update(encodedPayload).digest('hex');

  return `${ssoUrl}?sso=${encodeURIComponent(encodedPayload)}&sig=${signature}`;
}

export function validateDiscourseSSO(sso: string, sig: string): DiscoursePayload | null {
  const ssoSecret = process.env.DISCOURSE_SSO_SECRET;

  if (!ssoSecret) {
    throw new Error('DISCOURSE_SSO_SECRET must be configured');
  }

  try {
    // Vérifier la signature
    const hmac = crypto.createHmac('sha256', ssoSecret);
    const expectedSig = hmac.update(sso).digest('hex');

    if (sig !== expectedSig) {
      console.error('Invalid SSO signature');
      return null;
    }

    // Décoder le payload
    const decodedPayload = Buffer.from(sso, 'base64').toString('utf-8');
    const params = new URLSearchParams(decodedPayload);

    const nonce = params.get('nonce');
    const external_id = params.get('external_id');
    const email = params.get('email');
    const username = params.get('username');
    const name = params.get('name');

    if (!nonce || !external_id || !email) {
      console.error('Missing required SSO parameters');
      return null;
    }

    return {
      nonce,
      external_id,
      email,
      username: username || undefined,
      name: name || undefined,
    };
  } catch (error) {
    console.error('Error validating SSO:', error);
    return null;
  }
}
