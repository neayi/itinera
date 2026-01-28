import { NextRequest, NextResponse } from 'next/server';
import { WikiPages, WikiLocale } from '@/lib/wiki-pages';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = (searchParams.get('locale') || 'fr') as WikiLocale;

    const soils = await WikiPages.getSoils(locale);

    return NextResponse.json(soils);
  } catch (error) {
    console.error('Error fetching soils:', error);
    return NextResponse.json(
      { error: 'Failed to fetch soils' },
      { status: 500 }
    );
  }
}
