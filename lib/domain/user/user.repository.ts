/**
 * Interface Repository pour les utilisateurs
 */

import { UserEntity } from './user.entity';

export interface UserRepository {
  /**
   * Récupère un utilisateur par son ID
   */
  findById(id: number): Promise<UserEntity | null>;

  /**
   * Récupère un utilisateur par son external_id (Discourse SSO)
   */
  findByExternalId(externalId: string): Promise<UserEntity | null>;

  /**
   * Récupère un utilisateur par son email
   */
  findByEmail(email: string): Promise<UserEntity | null>;

  /**
   * Récupère tous les utilisateurs
   */
  findAll(): Promise<UserEntity[]>;

  /**
   * Crée un nouvel utilisateur
   */
  create(data: {
    external_id: string;
    name: string;
    email: string;
    username: string;
  }): Promise<UserEntity>;

  /**
   * Met à jour un utilisateur
   */
  update(
    userId: number,
    data: {
      name?: string;
      email?: string;
      username?: string;
    }
  ): Promise<void>;

  /**
   * Supprime un utilisateur
   */
  delete(userId: number): Promise<void>;

  /**
   * Crée ou met à jour un utilisateur (upsert pour SSO)
   */
  upsert(data: {
    external_id: string;
    name: string;
    email: string;
    username: string;
  }): Promise<UserEntity>;
}
