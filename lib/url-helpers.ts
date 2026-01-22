import type { NextRequest } from 'next/server';

/**
 * Get the base URL for the application (handles proxy/Traefik scenarios)
 *
 * This function resolves the correct public-facing URL of the application,
 * even when running behind a reverse proxy like Traefik.
 *
 * Priority order:
 * 1. NEXT_PUBLIC_APP_URL or APP_URL environment variables
 * 2. x-forwarded-proto and x-forwarded-host headers (from reverse proxy)
 * 3. request.url origin (fallback, won't work correctly behind proxy)
 *
 * @param request - The Next.js request object
 * @returns The base URL (e.g., "https://dev.itinera.ag")
 */
export function getBaseUrl(request: NextRequest): string {
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
