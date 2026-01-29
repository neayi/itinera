/**
 * Service ItineraParams - Orchestration métier
 */

import { ItineraParamDTO } from '@/shared/itinera-params/itinera-params.dto';
import { ItineraParamsRepository } from './itinera-params.repository';
import { ItineraParamEntity } from './itinera-params.entity';

export class ItineraParamsService {
  constructor(private readonly repository: ItineraParamsRepository) {}

  /**
   * Récupère un paramètre de type number
   */
  async getInt(key: string): Promise<number | null> {
    this.validateKey(key);
    return await this.repository.getInt(key);
  }

  /**
   * Récupère un paramètre de type Date
   */
  async getDateTime(key: string): Promise<Date | null> {
    this.validateKey(key);
    return await this.repository.getDateTime(key);
  }

  /**
   * Récupère un paramètre de type string
   */
  async getString(key: string): Promise<string | null> {
    this.validateKey(key);
    return await this.repository.getString(key);
  }

  /**
   * Définit un paramètre de type number
   */
  async setInt(key: string, value: number): Promise<void> {
    this.validateKey(key);
    await this.repository.setInt(key, value);
  }

  /**
   * Définit un paramètre de type Date
   */
  async setDateTime(key: string, value: Date): Promise<void> {
    this.validateKey(key);
    await this.repository.setDateTime(key, value);
  }

  /**
   * Définit un paramètre de type string
   */
  async setString(key: string, value: string): Promise<void> {
    this.validateKey(key);
    await this.repository.setString(key, value);
  }

  /**
   * Supprime un paramètre
   */
  async delete(key: string): Promise<void> {
    this.validateKey(key);
    await this.repository.delete(key);
  }

  /**
   * Vérifie si un paramètre existe
   */
  async exists(key: string): Promise<boolean> {
    this.validateKey(key);
    return await this.repository.exists(key);
  }

  /**
   * Récupère tous les paramètres
   */
  async getAll(): Promise<ItineraParamDTO[]> {
    return await this.repository.getAll();
  }

  /**
   * Valide la clé
   */
  private validateKey(key: string): void {
    if (!ItineraParamEntity.isValidKey(key)) {
      throw new Error('Invalid parameter key');
    }
  }
}
