/**
 * Entity System - Règles métier pures
 */

export class SystemEntity {
  constructor(
    public readonly id: string,
    public readonly farmId: number | null,
    public readonly userId: number,
    public name: string,
    public description: string | null,
    public systemType: string | null,
    public productions: string | null,
    public gpsLocation: string | null,
    public deptNo: string | null,
    public town: string | null,
    public json: any,
    public eiq: number | null,
    public grossMargin: number | null,
    public duration: number | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Vérifie si l'utilisateur est propriétaire du système
   */
  isOwnedBy(userId: number): boolean {
    return this.userId === userId;
  }

  /**
   * Renomme le système
   */
  rename(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Le nom du système ne peut pas être vide');
    }
    this.name = newName;
    this.updatedAt = new Date();
  }

  /**
   * Met à jour la description
   */
  updateDescription(description: string | null): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  /**
   * Met à jour la localisation
   */
  updateLocation(
    gpsLocation: string | null,
    deptNo: string | null,
    town: string | null
  ): void {
    this.gpsLocation = gpsLocation;
    this.deptNo = deptNo;
    this.town = town;
    this.updatedAt = new Date();
  }

  /**
   * Met à jour le JSON du système
   */
  updateJson(json: any): void {
    if (!json) {
      throw new Error('Le JSON du système ne peut pas être vide');
    }
    this.json = json;
    this.updatedAt = new Date();
  }

  /**
   * Valide les coordonnées GPS
   */
  static isValidGPS(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
}
