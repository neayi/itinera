/**
 * Interface Repository pour les systèmes de culture
 */

import { SystemEntity } from './system.entity';

export interface SystemRepository {
  /**
   * Récupère un système par son ID
   */
  findById(id: string): Promise<SystemEntity | null>;

  /**
   * Récupère tous les systèmes d'un utilisateur
   */
  findByUserId(userId: number): Promise<SystemEntity[]>;

  /**
   * Vérifie si un utilisateur est propriétaire d'un système
   */
  isOwner(systemId: string, userId: number): Promise<boolean>;

  /**
   * Met à jour les champs d'un système
   */
  update(
    systemId: string,
    data: {
      name?: string;
      description?: string;
      gps_location?: { lat: number; lng: number } | null;
      dept_no?: string;
      town?: string;
    }
  ): Promise<void>;

  /**
   * Met à jour le JSON d'un système avec calcul des totaux
   */
  updateJson(systemId: string, json: any): Promise<void>;

  /**
   * Supprime un système
   */
  delete(systemId: string): Promise<void>;

  /**
   * Crée un nouveau système
   */
  create(data: {
    farm_id?: number;
    user_id: number;
    name: string;
    description?: string;
    system_type?: string;
    productions?: string;
    json?: any;
  }): Promise<SystemEntity>;
}
