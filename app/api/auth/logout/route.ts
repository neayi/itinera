import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Supprimer le cookie de session
  response.cookies.delete('auth_token');

  return response;
}

export async function GET() {
  const response = NextResponse.redirect('/logout.html');

  // Supprimer le cookie de session
  response.cookies.delete('auth_token');

  return response;
}
