import { query, queryOne } from './db';

interface ItineraParamRow {
  key: string;
  value_int: number | null;
  value_datetime: Date | null;
  value_string: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Classe pour gérer les paramètres de configuration d'Itinera
 * Supporte les types : number, Date, string
 */
export class ItineraParams {
  /**
   * Récupère une valeur de type number
   */
  static async getInt(key: string): Promise<number | null> {
    const row = await queryOne<ItineraParamRow>(
      'SELECT value_int FROM itinera_params WHERE `key` = ?',
      [key]
    );
    return row?.value_int ?? null;
  }

  /**
   * Récupère une valeur de type Date
   */
  static async getDateTime(key: string): Promise<Date | null> {
    const row = await queryOne<ItineraParamRow>(
      'SELECT value_datetime FROM itinera_params WHERE `key` = ?',
      [key]
    );
    return row?.value_datetime ?? null;
  }

  /**
   * Récupère une valeur de type string
   */
  static async getString(key: string): Promise<string | null> {
    const row = await queryOne<ItineraParamRow>(
      'SELECT value_string FROM itinera_params WHERE `key` = ?',
      [key]
    );
    return row?.value_string ?? null;
  }

  /**
   * Définit une valeur de type number
   */
  static async setInt(key: string, value: number): Promise<void> {
    await query(
      `INSERT INTO itinera_params (\`key\`, value_int) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE value_int = ?, value_datetime = NULL, value_string = NULL`,
      [key, value, value]
    );
  }

  /**
   * Définit une valeur de type Date
   */
  static async setDateTime(key: string, value: Date): Promise<void> {
    await query(
      `INSERT INTO itinera_params (\`key\`, value_datetime) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE value_datetime = ?, value_int = NULL, value_string = NULL`,
      [key, value, value]
    );
  }

  /**
   * Définit une valeur de type string
   */
  static async setString(key: string, value: string): Promise<void> {
    await query(
      `INSERT INTO itinera_params (\`key\`, value_string) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE value_string = ?, value_int = NULL, value_datetime = NULL`,
      [key, value, value]
    );
  }

  /**
   * Supprime un paramètre
   */
  static async delete(key: string): Promise<void> {
    await query(
      'DELETE FROM itinera_params WHERE `key` = ?',
      [key]
    );
  }

  /**
   * Vérifie si un paramètre existe
   */
  static async exists(key: string): Promise<boolean> {
    const row = await queryOne<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM itinera_params WHERE `key` = ?',
      [key]
    );
    return (row?.cnt ?? 0) > 0;
  }

  /**
   * Récupère tous les paramètres
   */
  static async getAll(): Promise<ItineraParamRow[]> {
    return await query<ItineraParamRow>(
      'SELECT * FROM itinera_params ORDER BY `key`',
      []
    );
  }
}
