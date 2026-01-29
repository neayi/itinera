/**
 * Service User - Orchestration métier
 */

import { UserDTO } from '@/shared/user/user.dto';
import { UserRepository } from './user.repository';
import { UserEntity } from './user.entity';

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  private toDTO(entity: UserEntity): UserDTO {
    return {
      id: entity.id,
      external_id: entity.externalId,
      name: entity.name,
      email: entity.email,
      username: entity.username,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };
  }

  /**
   * Récupère un utilisateur par son ID
   */
  async getUserById(id: number): Promise<UserDTO | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.toDTO(entity) : null;
  }

  /**
   * Récupère un utilisateur par son external_id
   */
  async getUserByExternalId(externalId: string): Promise<UserDTO | null> {
    const entity = await this.repository.findByExternalId(externalId);
    return entity ? this.toDTO(entity) : null;
  }

  /**
   * Récupère un utilisateur par son email
   */
  async getUserByEmail(email: string): Promise<UserDTO | null> {
    const entity = await this.repository.findByEmail(email);
    return entity ? this.toDTO(entity) : null;
  }

  /**
   * Récupère tous les utilisateurs
   */
  async getAllUsers(): Promise<UserDTO[]> {
    const entities = await this.repository.findAll();
    return entities.map(entity => this.toDTO(entity));
  }

  /**
   * Crée un nouvel utilisateur
   */
  async createUser(data: Omit<UserDTO, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    // Validation
    if (!UserEntity.isValidName(data.name)) {
      throw new Error('Le nom ne peut pas être vide');
    }

    if (!UserEntity.isValidEmail(data.email)) {
      throw new Error('Format d\'email invalide');
    }

    if (!UserEntity.isValidUsername(data.username)) {
      throw new Error('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères');
    }

    // Vérifier l'unicité de l'email
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const entity = await this.repository.create(data);
    return entity.id;
  }

  /**
   * Met à jour un utilisateur
   */
  async updateUser(userId: number, data: Partial<UserDTO>): Promise<void> {
    // Vérifier que l'utilisateur existe
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    // Validation
    if (data.name !== undefined && !UserEntity.isValidName(data.name)) {
      throw new Error('Le nom ne peut pas être vide');
    }

    if (data.email !== undefined && !UserEntity.isValidEmail(data.email)) {
      throw new Error('Format d\'email invalide');
    }

    if (data.username !== undefined && !UserEntity.isValidUsername(data.username)) {
      throw new Error('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères');
    }

    // Vérifier l'unicité de l'email si changé
    if (data.email && data.email !== user.email) {
      const existingUser = await this.repository.findByEmail(data.email);
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
    }

    await this.repository.update(userId, data);
  }

  /**
   * Supprime un utilisateur
   */
  async deleteUser(userId: number): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    await this.repository.delete(userId);
  }

  /**
   * Crée ou met à jour un utilisateur (pour SSO)
   */
  async upsertUser(data: Omit<UserDTO, 'id' | 'created_at' | 'updated_at'>): Promise<UserDTO> {
    // Validation
    if (!UserEntity.isValidName(data.name)) {
      throw new Error('Le nom ne peut pas être vide');
    }

    if (!UserEntity.isValidEmail(data.email)) {
      throw new Error('Format d\'email invalide');
    }

    if (!UserEntity.isValidUsername(data.username)) {
      throw new Error('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères');
    }

    const entity = await this.repository.upsert(data);
    return this.toDTO(entity);
  }
}
