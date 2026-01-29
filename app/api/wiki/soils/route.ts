import { NextRequest, NextResponse } from 'next/server';
import { WikiPagesService, MySQLWikiPagesRepository } from '@/lib/domain/wiki-pages';
import { WikiLocale } from '@/shared/wiki-pages/wiki-pages.dto';

const wikiPagesService = new WikiPagesService(new MySQLWikiPagesRepository());

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = (searchParams.get('locale') || 'fr') as WikiLocale;

    const soils = await wikiPagesService.getSoils(locale);

    return NextResponse.json(soils);
  } catch (error) {
    console.error('Error fetching soils:', error);
    return NextResponse.json(
      { error: 'Failed to fetch soils' },
      { status: 500 }
    );
  }
}
