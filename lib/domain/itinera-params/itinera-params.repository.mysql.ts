/**
 * Implémentation MySQL du repository ItineraParams
 */

import { query, queryOne } from '@/lib/db';
import { ItineraParamDTO } from '@/shared/itinera-params/itinera-params.dto';
import { ItineraParamsRepository } from './itinera-params.repository';

export class MySQLItineraParamsRepository implements ItineraParamsRepository {
  async getInt(key: string): Promise<number | null> {
    const row = await queryOne<ItineraParamDTO>(
      'SELECT value_int FROM itinera_params WHERE `key` = ?',
      [key]
    );
    return row?.value_int ?? null;
  }

  async getDateTime(key: string): Promise<Date | null> {
    const row = await queryOne<ItineraParamDTO>(
      'SELECT value_datetime FROM itinera_params WHERE `key` = ?',
      [key]
    );
    return row?.value_datetime ?? null;
  }

  async getString(key: string): Promise<string | null> {
    const row = await queryOne<ItineraParamDTO>(
      'SELECT value_string FROM itinera_params WHERE `key` = ?',
      [key]
    );
    return row?.value_string ?? null;
  }

  async setInt(key: string, value: number): Promise<void> {
    await query(
      `INSERT INTO itinera_params (\`key\`, value_int) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE value_int = ?, value_datetime = NULL, value_string = NULL`,
      [key, value, value]
    );
  }

  async setDateTime(key: string, value: Date): Promise<void> {
    await query(
      `INSERT INTO itinera_params (\`key\`, value_datetime) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE value_datetime = ?, value_int = NULL, value_string = NULL`,
      [key, value, value]
    );
  }

  async setString(key: string, value: string): Promise<void> {
    await query(
      `INSERT INTO itinera_params (\`key\`, value_string) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE value_string = ?, value_int = NULL, value_datetime = NULL`,
      [key, value, value]
    );
  }

  async delete(key: string): Promise<void> {
    await query(
      'DELETE FROM itinera_params WHERE `key` = ?',
      [key]
    );
  }

  async exists(key: string): Promise<boolean> {
    const row = await queryOne<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM itinera_params WHERE `key` = ?',
      [key]
    );
    return (row?.cnt ?? 0) > 0;
  }

  async getAll(): Promise<ItineraParamDTO[]> {
    return await query<ItineraParamDTO>(
      'SELECT * FROM itinera_params ORDER BY `key`'
    );
  }
}

// Export static class for backward compatibility
export class ItineraParams {
  private static repository = new MySQLItineraParamsRepository();

  static async getInt(key: string): Promise<number | null> {
    return await this.repository.getInt(key);
  }

  static async getDateTime(key: string): Promise<Date | null> {
    return await this.repository.getDateTime(key);
  }

  static async getString(key: string): Promise<string | null> {
    return await this.repository.getString(key);
  }

  static async setInt(key: string, value: number): Promise<void> {
    await this.repository.setInt(key, value);
  }

  static async setDateTime(key: string, value: Date): Promise<void> {
    await this.repository.setDateTime(key, value);
  }

  static async setString(key: string, value: string): Promise<void> {
    await this.repository.setString(key, value);
  }

  static async delete(key: string): Promise<void> {
    await this.repository.delete(key);
  }

  static async exists(key: string): Promise<boolean> {
    return await this.repository.exists(key);
  }

  static async getAll(): Promise<ItineraParamDTO[]> {
    return await this.repository.getAll();
  }
}
