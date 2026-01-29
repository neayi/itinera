/**
 * Module de lecture pour les systèmes avec données de ferme
 * Opérations en lecture seule avec jointures
 */

import { query, queryOne } from '@/lib/db';
import { SystemWithFarmDTO } from '@/shared/system-with-farm/system-with-farm.dto';

/**
 * Récupère un système avec les données de sa ferme
 */
export async function getSystemWithFarm(systemId: string): Promise<SystemWithFarmDTO | null> {
  const result = await queryOne<SystemWithFarmDTO>(`
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
      s.updated_at,
      f.name as farm_name,
      f.farmer_name
    FROM systems s
    LEFT JOIN farms f ON s.farm_id = f.id
    WHERE s.id = ?
  `, [systemId]);

  return result || null;
}

/**
 * Récupère tous les systèmes d'un utilisateur avec les données de leurs fermes
 * Note: Le champ json n'est pas inclus pour éviter les problèmes de mémoire lors du tri
 */
export async function getUserSystemsWithFarms(userId: number): Promise<SystemWithFarmDTO[]> {
  return await query<SystemWithFarmDTO>(`
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
      NULL as json,
      s.eiq,
      s.gross_margin,
      s.duration,
      s.created_at,
      s.updated_at,
      f.name as farm_name,
      f.farmer_name
    FROM systems s
    LEFT JOIN farms f ON s.farm_id = f.id
    WHERE s.user_id = ?
    ORDER BY s.updated_at DESC
  `, [userId]);
}
