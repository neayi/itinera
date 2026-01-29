/**
 * DTOs pour les pages wiki
 */

export interface WikiPageDTO {
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

export const WIKI_LOCALES = ['fr', 'de', 'en', 'el', 'es', 'fi', 'hu', 'it', 'nl', 'pl', 'pt', 'ar'] as const;
export type WikiLocale = typeof WIKI_LOCALES[number];
