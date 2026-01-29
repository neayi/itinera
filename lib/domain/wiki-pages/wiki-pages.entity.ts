/**
 * Entity WikiPage - Règles métier pures
 */

export class WikiPageEntity {
  constructor(
    public readonly id: number,
    public readonly pageName: string,
    public readonly pageId: number,
    public readonly locale: string,
    public readonly isSpecification: boolean,
    public readonly isSoil: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Valide le nom de la page
   */
  static isValidPageName(name: string): boolean {
    return !!name && name.trim().length > 0;
  }

  /**
   * Valide l'ID de la page
   */
  static isValidPageId(id: number): boolean {
    return id > 0;
  }
}
