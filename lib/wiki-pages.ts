import { query } from './db';
import { ItineraParams } from './itinera-params';

export const WIKI_LOCALES = ['fr', 'de', 'en', 'el', 'es', 'fi', 'hu', 'it', 'nl', 'pl', 'pt', 'ar'] as const;
export type WikiLocale = typeof WIKI_LOCALES[number];

interface WikiPageRow {
  id: number;
  page_name: string;
  page_id: number;
  wiki_locale: string;
  specification: number;
  soil: number;
  transaction: string | null;
  created_at: Date;
  updated_at: Date;
}

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

/**
 * Classe pour gérer les pages wiki de référentiel
 */
export class WikiPages {
  private static readonly REFRESH_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
  private static readonly ASK_SPECIFICATIONS = '[[Est un élément de profil::Cahier des charges]]|?Page ID|limit=1000';
  private static readonly ASK_SOILS = '[[Category:Types de sol]]|?Page ID|limit=1000';

  /**
   * Génère une chaîne de transaction aléatoire
   */
  private static generateTransaction(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Construit l'URL de l'API wiki
   */
  private static getWikiUrl(locale: WikiLocale = 'fr'): string {
    return `https://${locale}.tripleperformance.ag`;
  }

  /**
   * Effectue une requête Ask sur l'API wiki
   */
  private static async fetchWikiData(
    askQuery: string,
    locale: WikiLocale = 'fr'
  ): Promise<WikiApiResult> {
    const params = new URLSearchParams({
      action: 'ask',
      api_version: '3',
      query: askQuery,
      format: 'json',
    });

    const url = `${this.getWikiUrl(locale)}/api.php?${params.toString()}`;
        
    console.log('URL : ', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Wiki API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  }

  /**
   * Vérifie si les données doivent être rafraîchies
   */
  private static async shouldRefresh(key: string): Promise<boolean> {
    const lastUpdate = await ItineraParams.getDateTime(key);
    if (!lastUpdate) {
      return true;
    }

    const now = new Date();
    const timeSinceUpdate = now.getTime() - lastUpdate.getTime();
    return timeSinceUpdate > this.REFRESH_INTERVAL_MS;
  }

  /**
   * Importe les pages depuis l'API wiki
   */
  private static async importPages(
    askQuery: string,
    type: 'specification' | 'soil',
    locale: WikiLocale = 'fr'
  ): Promise<void> {
    const transaction = this.generateTransaction();
    
    try {
      const data = await this.fetchWikiData(askQuery, locale);
      
      if (!data.query?.results) {
        console.warn(`No results from wiki API for ${type}`);
        return;
      }

      // Les résultats sont un tableau d'objets où chaque objet a une clé = nom de page
      const results = data.query.results;
      
      for (const resultObj of results) {
        // Extraire le premier (et seul) objet de chaque élément du tableau
        const pageData = Object.values(resultObj)[0] as any;
        
        if (!pageData) continue;
        
        const pageName = pageData.fulltext;
        
        console.log('Processing page:', pageName, JSON.stringify(pageData.printouts));

        const pageIdArray = pageData.printouts['Identifiant de page'];
        
        if (!pageIdArray || pageIdArray.length === 0) {
          console.warn(`No Page ID for ${pageName}`);
          continue;
        }

        // Le pageId est directement un nombre dans le tableau, pas un objet
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

      // Supprimer les pages qui n'ont pas été mises à jour (pages supprimées du wiki)
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

  /**
   * Rafraîchit les données si nécessaire
   */
  private static async refreshIfNeeded(
    type: 'specification' | 'soil',
    locale: WikiLocale = 'fr'
  ): Promise<void> {
    const key = `wiki_${type}_last_update_${locale}`;
    
    if (await this.shouldRefresh(key)) {
      const askQuery = type === 'specification' ? this.ASK_SPECIFICATIONS : this.ASK_SOILS;
      await this.importPages(askQuery, type, locale);
      await ItineraParams.setDateTime(key, new Date());
    }
  }

  /**
   * Récupère la liste des cahiers des charges
   */
  static async getSpecifications(locale: WikiLocale = 'fr'): Promise<WikiPageRow[]> {
    await this.refreshIfNeeded('specification', locale);
    
    return await query<WikiPageRow>(
      'SELECT * FROM wiki_pages WHERE specification = 1 AND wiki_locale = ? ORDER BY page_name',
      [locale]
    );
  }

  /**
   * Récupère la liste des types de sol
   */
  static async getSoils(locale: WikiLocale = 'fr'): Promise<WikiPageRow[]> {
    await this.refreshIfNeeded('soil', locale);
    
    return await query<WikiPageRow>(
      'SELECT * FROM wiki_pages WHERE soil = 1 AND wiki_locale = ? ORDER BY page_name',
      [locale]
    );
  }

  /**
   * Force le rafraîchissement des données
   */
  static async forceRefresh(
    type: 'specification' | 'soil',
    locale: WikiLocale = 'fr'
  ): Promise<void> {
    const askQuery = type === 'specification' ? this.ASK_SPECIFICATIONS : this.ASK_SOILS;
    await this.importPages(askQuery, type, locale);
    await ItineraParams.setDateTime(`wiki_${type}_last_update_${locale}`, new Date());
  }

  /**
   * Récupère une page par son ID
   */
  static async getPageById(
    pageId: number,
    locale: WikiLocale = 'fr'
  ): Promise<WikiPageRow | null> {
    const results = await query<WikiPageRow>(
      'SELECT * FROM wiki_pages WHERE page_id = ? AND wiki_locale = ? LIMIT 1',
      [pageId, locale]
    );
    return results[0] || null;
  }
}
