/**
 * Implémentation MySQL du repository WikiPages
 */

import { query, queryOne } from '@/lib/db';
import { WikiPageDTO, WikiLocale } from '@/shared/wiki-pages/wiki-pages.dto';
import { WikiPagesRepository } from './wiki-pages.repository';
import { ItineraParams } from '../itinera-params/itinera-params.repository.mysql';

interface WikiApiResult {
  query: {
    results: Array<Record<string, {
      fulltext: string;
      printouts: {
        'Identifiant de page': number[];
        'Date de modification': Array<{
          timestamp: string;
          raw: string;
        }>;
      };
    }>>;
  };
}

export class MySQLWikiPagesRepository implements WikiPagesRepository {
  private static readonly WIKI_URL_BASE = 'https://{locale}.tripleperformance.ag';

  async getSpecifications(locale: WikiLocale): Promise<WikiPageDTO[]> {
    return await query<WikiPageDTO>(
      'SELECT * FROM wiki_pages WHERE specification = 1 AND wiki_locale = ? ORDER BY page_name',
      [locale]
    );
  }

  async getSoils(locale: WikiLocale): Promise<WikiPageDTO[]> {
    return await query<WikiPageDTO>(
      'SELECT * FROM wiki_pages WHERE soil = 1 AND wiki_locale = ? ORDER BY page_name',
      [locale]
    );
  }

  async getPageById(pageId: number, locale: WikiLocale): Promise<WikiPageDTO | null> {
    const results = await query<WikiPageDTO>(
      'SELECT * FROM wiki_pages WHERE page_id = ? AND wiki_locale = ? LIMIT 1',
      [pageId, locale]
    );
    return results[0] || null;
  }

  async importPages(
    askQuery: string,
    type: 'specification' | 'soil',
    locale: WikiLocale
  ): Promise<void> {
    const transaction = this.generateTransaction();
    
    try {
      const data = await this.fetchWikiData(askQuery, locale);
      
      if (!data.query?.results) {
        console.warn(`No results from wiki API for ${type}`);
        return;
      }

      const results = data.query.results;
      
      for (const resultObj of results) {
        const pageData = Object.values(resultObj)[0] as any;
        
        if (!pageData) continue;
        
        const pageName = pageData.fulltext;
        const pageIdArray = pageData.printouts['Identifiant de page'];
        
        if (!pageIdArray || pageIdArray.length === 0) {
          console.warn(`No Page ID for ${pageName}`);
          continue;
        }

        const pageId = parseInt(pageIdArray[0], 10);
        
        if (isNaN(pageId)) {
          console.warn(`Invalid Page ID for ${pageName}:`, pageIdArray[0]);
          continue;
        }

        await query(
          `INSERT INTO wiki_pages (page_name, page_id, wiki_locale, specification, soil, transaction)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             page_name = VALUES(page_name),
             specification = VALUES(specification),
             soil = VALUES(soil),
             transaction = VALUES(transaction)`,
          [
            pageName,
            pageId,
            locale,
            type === 'specification' ? 1 : 0,
            type === 'soil' ? 1 : 0,
            transaction
          ]
        );
      }

      // Supprimer les pages qui n'ont pas été mises à jour
      await query(
        `DELETE FROM wiki_pages 
         WHERE wiki_locale = ? AND ${type} = 1 AND (transaction != ? OR transaction IS NULL)`,
        [locale, transaction]
      );

      console.log(`Imported ${results.length} ${type} pages from wiki (${locale})`);
    } catch (error) {
      console.error(`Error importing ${type} pages from wiki:`, error);
      throw error;
    }
  }

  async getLastRefreshDate(type: 'specification' | 'soil', locale: WikiLocale): Promise<Date | null> {
    const key = `wiki_${type}_last_update_${locale}`;
    return await ItineraParams.getDateTime(key);
  }

  async setLastRefreshDate(type: 'specification' | 'soil', locale: WikiLocale, date: Date): Promise<void> {
    const key = `wiki_${type}_last_update_${locale}`;
    await ItineraParams.setDateTime(key, date);
  }

  private generateTransaction(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private async fetchWikiData(
    askQuery: string,
    locale: WikiLocale
  ): Promise<WikiApiResult> {
    const params = new URLSearchParams({
      action: 'ask',
      api_version: '3',
      query: askQuery,
      format: 'json',
    });

    const url = `${MySQLWikiPagesRepository.WIKI_URL_BASE.replace('{locale}', locale)}/api.php?${params.toString()}`;
    
    console.log('Fetching wiki data:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Wiki API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}
