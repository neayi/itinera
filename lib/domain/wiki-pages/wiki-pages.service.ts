/**
 * Service WikiPages - Orchestration métier
 */

import { WikiPageDTO, WikiLocale } from '@/shared/wiki-pages/wiki-pages.dto';
import { WikiPagesRepository } from './wiki-pages.repository';

export class WikiPagesService {
  private static readonly REFRESH_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
  private static readonly ASK_SPECIFICATIONS = '[[Est un élément de profil::Cahier des charges]]|?Page ID|limit=1000';
  private static readonly ASK_SOILS = '[[Category:Types de sol]]|?Page ID|limit=1000';

  constructor(private readonly repository: WikiPagesRepository) {}

  /**
   * Récupère les spécifications (avec auto-refresh)
   */
  async getSpecifications(locale: WikiLocale = 'fr'): Promise<WikiPageDTO[]> {
    await this.refreshIfNeeded('specification', locale);
    return await this.repository.getSpecifications(locale);
  }

  /**
   * Récupère les types de sol (avec auto-refresh)
   */
  async getSoils(locale: WikiLocale = 'fr'): Promise<WikiPageDTO[]> {
    await this.refreshIfNeeded('soil', locale);
    return await this.repository.getSoils(locale);
  }

  /**
   * Récupère une page par son ID
   */
  async getPageById(pageId: number, locale: WikiLocale = 'fr'): Promise<WikiPageDTO | null> {
    return await this.repository.getPageById(pageId, locale);
  }

  /**
   * Force le rafraîchissement des données
   */
  async forceRefresh(type: 'specification' | 'soil', locale: WikiLocale = 'fr'): Promise<void> {
    const askQuery = type === 'specification' 
      ? WikiPagesService.ASK_SPECIFICATIONS 
      : WikiPagesService.ASK_SOILS;
    
    await this.repository.importPages(askQuery, type, locale);
    await this.repository.setLastRefreshDate(type, locale, new Date());
  }

  /**
   * Rafraîchit les données si nécessaire
   */
  private async refreshIfNeeded(
    type: 'specification' | 'soil',
    locale: WikiLocale
  ): Promise<void> {
    const lastUpdate = await this.repository.getLastRefreshDate(type, locale);
    
    if (!lastUpdate) {
      await this.forceRefresh(type, locale);
      return;
    }

    const now = new Date();
    const timeSinceUpdate = now.getTime() - lastUpdate.getTime();
    
    if (timeSinceUpdate > WikiPagesService.REFRESH_INTERVAL_MS) {
      await this.forceRefresh(type, locale);
    }
  }
}
