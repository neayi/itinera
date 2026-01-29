/**
 * Entity ItineraParam - Règles métier pures
 */

export class ItineraParamEntity {
  constructor(
    public readonly key: string,
    public value: number | Date | string | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Valide la clé
   */
  static isValidKey(key: string): boolean {
    return !!key && key.trim().length > 0 && key.length <= 255;
  }

  /**
   * Met à jour la valeur
   */
  updateValue(value: number | Date | string | null): void {
    this.value = value;
    this.updatedAt = new Date();
  }
}
