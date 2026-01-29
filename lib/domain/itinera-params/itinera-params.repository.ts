/**
 * Interface Repository pour les paramètres Itinera
 */

import { ItineraParamDTO } from '@/shared/itinera-params/itinera-params.dto';

export interface ItineraParamsRepository {
  /**
   * Récupère une valeur de type number
   */
  getInt(key: string): Promise<number | null>;

  /**
   * Récupère une valeur de type Date
   */
  getDateTime(key: string): Promise<Date | null>;

  /**
   * Récupère une valeur de type string
   */
  getString(key: string): Promise<string | null>;

  /**
   * Définit une valeur de type number
   */
  setInt(key: string, value: number): Promise<void>;

  /**
   * Définit une valeur de type Date
   */
  setDateTime(key: string, value: Date): Promise<void>;

  /**
   * Définit une valeur de type string
   */
  setString(key: string, value: string): Promise<void>;

  /**
   * Supprime un paramètre
   */
  delete(key: string): Promise<void>;

  /**
   * Vérifie si un paramètre existe
   */
  exists(key: string): Promise<boolean>;

  /**
   * Récupère tous les paramètres
   */
  getAll(): Promise<ItineraParamDTO[]>;
}
