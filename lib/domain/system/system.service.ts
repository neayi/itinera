/**
 * Service System - Orchestration métier
 */

import { SystemDTO } from '@/shared/system/system.dto';
import { SystemRepository } from './system.repository';
import { SystemEntity } from './system.entity';

export class SystemService {
  constructor(private readonly repository: SystemRepository) {}

  private toDTO(entity: SystemEntity): SystemDTO {
    return {
      id: entity.id,
      farm_id: entity.farmId,
      user_id: entity.userId,
      name: entity.name,
      description: entity.description,
      system_type: entity.systemType,
      productions: entity.productions,
      gps_location: entity.gpsLocation,
      dept_no: entity.deptNo,
      town: entity.town,
      json: entity.json,
      eiq: entity.eiq,
      gross_margin: entity.grossMargin,
      duration: entity.duration,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };
  }

  /**
   * Récupère un système par son ID
   */
  async getSystemById(id: string): Promise<SystemDTO | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.toDTO(entity) : null;
  }

  /**
   * Récupère tous les systèmes d'un utilisateur
   */
  async getUserSystems(userId: number): Promise<SystemDTO[]> {
    const entities = await this.repository.findByUserId(userId);
    return entities.map(entity => this.toDTO(entity));
  }

  /**
   * Vérifie les permissions d'accès à un système
   */
  async checkOwnership(systemId: string, userId: number): Promise<void> {
    const isOwner = await this.repository.isOwner(systemId, userId);
    if (!isOwner) {
      throw new Error('Forbidden: You are not the owner of this system');
    }
  }

  /**
   * Renomme un système
   */
  async renameSystem(systemId: string, userId: number, name: string): Promise<void> {
    await this.checkOwnership(systemId, userId);
    
    // Validation via l'entity - créer une entity minimale pour validation
    if (!name || name.trim().length === 0) {
      throw new Error('Le nom du système ne peut pas être vide');
    }

    await this.repository.update(systemId, { name });
  }

  /**
   * Met à jour un système
   */
  async updateSystem(
    systemId: string,
    userId: number,
    data: Partial<SystemDTO>
  ): Promise<void> {
    await this.checkOwnership(systemId, userId);

    // Validation des GPS si fournis
    if (data.gps_location && typeof data.gps_location === 'object' && 'lat' in data.gps_location) {
      const { lat, lng } = data.gps_location;
      if (!SystemEntity.isValidGPS(lat, lng)) {
        throw new Error('Invalid GPS coordinates');
      }
    }

    // Mise à jour du JSON si fourni
    if (data.json) {
      await this.repository.updateJson(systemId, data.json);
    }

    // Mise à jour des autres champs
    const updateData: {
      name?: string;
      description?: string;
      gps_location?: { lat: number; lng: number } | null;
      dept_no?: string;
      town?: string;
    } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description ?? undefined;
    if (data.gps_location !== undefined) {
      if (data.gps_location && typeof data.gps_location === 'object' && 'lat' in data.gps_location) {
        updateData.gps_location = data.gps_location;
      } else if (data.gps_location === null) {
        updateData.gps_location = null;
      }
    }
    if (data.dept_no !== undefined) updateData.dept_no = data.dept_no ?? undefined;
    if (data.town !== undefined) updateData.town = data.town ?? undefined;

    await this.repository.update(systemId, updateData);
  }

  /**
   * Supprime un système
   */
  async deleteSystem(systemId: string, userId: number): Promise<void> {
    await this.checkOwnership(systemId, userId);
    await this.repository.delete(systemId);
  }

  /**
   * Crée un nouveau système
   */
  async createSystem(data: Omit<SystemDTO, 'id' | 'created_at' | 'updated_at' | 'eiq' | 'gross_margin' | 'duration'>): Promise<string> {
    // Validation
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Le nom du système ne peut pas être vide');
    }

    const createData: {
      farm_id?: number;
      user_id: number;
      name: string;
      description?: string;
      system_type?: string;
      productions?: string;
      json?: any;
    } = {
      user_id: data.user_id,
      name: data.name,
    };

    if (data.farm_id !== null && data.farm_id !== undefined) createData.farm_id = data.farm_id;
    if (data.description !== null && data.description !== undefined) createData.description = data.description;
    if (data.system_type !== null && data.system_type !== undefined) createData.system_type = data.system_type;
    if (data.productions !== null && data.productions !== undefined) createData.productions = data.productions;
    if (data.json !== undefined) createData.json = data.json;

    const entity = await this.repository.create(createData);
    return entity.id;
  }
}
