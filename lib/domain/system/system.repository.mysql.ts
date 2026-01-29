/**
 * Implémentation MySQL du repository System
 */

import { query, queryOne } from '@/lib/db';
import { SystemEntity } from './system.entity';
import { SystemRepository } from './system.repository';
import { saveSystemTotals } from '@/lib/persist-system';

interface SystemRow {
  id: string;
  farm_id: number | null;
  user_id: number;
  name: string;
  description: string | null;
  system_type: string | null;
  productions: string | null;
  gps_location: string | null;
  dept_no: string | null;
  town: string | null;
  json: any;
  eiq: number | null;
  gross_margin: number | null;
  duration: number | null;
  created_at: Date;
  updated_at: Date;
}

export class MySQLSystemRepository implements SystemRepository {
  private toEntity(row: SystemRow): SystemEntity {
    return new SystemEntity(
      row.id,
      row.farm_id,
      row.user_id,
      row.name,
      row.description,
      row.system_type,
      row.productions,
      row.gps_location,
      row.dept_no,
      row.town,
      typeof row.json === 'string' ? JSON.parse(row.json) : row.json,
      row.eiq,
      row.gross_margin,
      row.duration,
      row.created_at,
      row.updated_at
    );
  }

  async findById(id: string): Promise<SystemEntity | null> {
    const row = await queryOne<SystemRow>(`
      SELECT
        s.id,
        s.farm_id,
        s.user_id,
        s.name,
        s.description,
        s.system_type,
        s.productions,
        CASE 
          WHEN s.gps_location IS NOT NULL THEN CONCAT(ST_Y(s.gps_location), ', ', ST_X(s.gps_location))
          ELSE NULL
        END as gps_location,
        s.dept_no,
        s.town,
        s.json,
        s.eiq,
        s.gross_margin,
        s.duration,
        s.created_at,
        s.updated_at
      FROM systems s
      WHERE s.id = ?
    `, [id]);

    return row ? this.toEntity(row) : null;
  }

  async findByUserId(userId: number): Promise<SystemEntity[]> {
    const rows = await query<SystemRow>(`
      SELECT
        s.id,
        s.farm_id,
        s.user_id,
        s.name,
        s.description,
        s.system_type,
        s.productions,
        CASE 
          WHEN s.gps_location IS NOT NULL THEN CONCAT(ST_Y(s.gps_location), ', ', ST_X(s.gps_location))
          ELSE NULL
        END as gps_location,
        s.dept_no,
        s.town,
        s.json,
        s.eiq,
        s.gross_margin,
        s.duration,
        s.created_at,
        s.updated_at
      FROM systems s
      WHERE s.user_id = ?
      ORDER BY s.updated_at DESC
    `, [userId]);

    return rows.map(row => this.toEntity(row));
  }

  async isOwner(systemId: string, userId: number): Promise<boolean> {
    const result = await queryOne<{ user_id: number }>(
      'SELECT user_id FROM systems WHERE id = ?',
      [systemId]
    );

    return result?.user_id === userId;
  }

  async update(
    systemId: string,
    data: {
      name?: string;
      description?: string;
      gps_location?: { lat: number; lng: number } | null;
      dept_no?: string;
      town?: string;
    }
  ): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (data.gps_location !== undefined) {
      if (data.gps_location === null) {
        updates.push('gps_location = NULL');
      } else {
        // Convert {lat, lng} to POINT(lng, lat) - MySQL POINT uses (longitude, latitude) order
        updates.push('gps_location = POINT(?, ?)');
        values.push(data.gps_location.lng, data.gps_location.lat);
      }
    }

    if (data.dept_no !== undefined) {
      updates.push('dept_no = ?');
      values.push(data.dept_no);
    }

    if (data.town !== undefined) {
      updates.push('town = ?');
      values.push(data.town);
    }

    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      values.push(systemId);
      await query(
        `UPDATE systems SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }
  }

  async updateJson(systemId: string, json: any): Promise<void> {
    await saveSystemTotals(systemId, json);
  }

  async delete(systemId: string): Promise<void> {
    await query('DELETE FROM systems WHERE id = ?', [systemId]);
  }

  async create(data: {
    farm_id?: number;
    user_id: number;
    name: string;
    description?: string;
    system_type?: string;
    productions?: string;
    json?: any;
  }): Promise<SystemEntity> {
    const result: any = await query(
      `INSERT INTO systems (farm_id, user_id, name, description, system_type, productions, json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.farm_id || null,
        data.user_id,
        data.name,
        data.description || null,
        data.system_type || null,
        data.productions || null,
        JSON.stringify(data.json || {})
      ]
    );

    const systemId = result.insertId.toString();
    return (await this.findById(systemId))!;
  }
}
