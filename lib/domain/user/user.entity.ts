/**
 * Entity User - Règles métier pures
 */

export class UserEntity {
  constructor(
    public readonly id: number,
    public readonly externalId: string,
    public name: string,
    public email: string,
    public username: string,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Valide le format de l'email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valide le nom d'utilisateur
   */
  static isValidUsername(username: string): boolean {
    return !!username && username.trim().length >= 3 && username.trim().length <= 50;
  }

  /**
   * Valide le nom
   */
  static isValidName(name: string): boolean {
    return !!name && name.trim().length > 0;
  }

  /**
   * Met à jour le nom
   */
  updateName(newName: string): void {
    if (!UserEntity.isValidName(newName)) {
      throw new Error('Le nom ne peut pas être vide');
    }
    this.name = newName;
    this.updatedAt = new Date();
  }

  /**
   * Met à jour l'email
   */
  updateEmail(newEmail: string): void {
    if (!UserEntity.isValidEmail(newEmail)) {
      throw new Error('Format d\'email invalide');
    }
    this.email = newEmail;
    this.updatedAt = new Date();
  }

  /**
   * Met à jour le username
   */
  updateUsername(newUsername: string): void {
    if (!UserEntity.isValidUsername(newUsername)) {
      throw new Error('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères');
    }
    this.username = newUsername;
    this.updatedAt = new Date();
  }
}
