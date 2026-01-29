/**
 * Interface Repository pour les pages wiki
 */

import { WikiPageDTO, WikiLocale } from '@/shared/wiki-pages/wiki-pages.dto';

export interface WikiPagesRepository {
  /**
   * Récupère toutes les spécifications
   */
  getSpecifications(locale: WikiLocale): Promise<WikiPageDTO[]>;

  /**
   * Récupère tous les types de sol
   */
  getSoils(locale: WikiLocale): Promise<WikiPageDTO[]>;

  /**
   * Récupère une page par son ID
   */
  getPageById(pageId: number, locale: WikiLocale): Promise<WikiPageDTO | null>;

  /**
   * Importe les pages depuis une source externe
   */
  importPages(
    askQuery: string,
    type: 'specification' | 'soil',
    locale: WikiLocale
  ): Promise<void>;

  /**
   * Vérifie la dernière date de rafraîchissement
   */
  getLastRefreshDate(type: 'specification' | 'soil', locale: WikiLocale): Promise<Date | null>;

  /**
   * Met à jour la date de rafraîchissement
   */
  setLastRefreshDate(type: 'specification' | 'soil', locale: WikiLocale, date: Date): Promise<void>;
}
