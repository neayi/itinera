import { query } from '@/lib/db';
import { calculateSystemTotals } from './calculate-system-totals';
import { getRotationDurationYears } from './calculate-rotation-duration';

/**
 * Save system data to database (SERVER-SIDE ONLY)
 * This function persists the system data to the database.
 */
export async function saveSystemTotals(systemId: string, systemData: any) {
  const eiq = systemData.systemIndicators?.eiqParHaParAn ?? 0;
  const gross_margin = systemData.systemIndicators?.margeBruteParHaParAn ?? 0;
  const duration = systemData.systemIndicators?.nbYears ?? 0;

  await query(
    'UPDATE systems SET json = ?, eiq = ?, gross_margin = ?, duration = ?, updated_at = NOW() WHERE id = ?',
    [JSON.stringify(systemData), eiq, gross_margin, duration, systemId]
  );
  return systemData;
}

/**
 * Calculate and save all totals in the system data (CONVENIENCE FUNCTION)
 * This combines calculateSystemTotals() + saveSystemTotals() for backward compatibility.
 * Use this in API routes for automatic calculation + save.
 */
export async function calculateAndSaveSystemTotals(systemId: string, systemData: any) {
  const updatedSystemData = calculateSystemTotals(systemData);
  return await saveSystemTotals(systemId, updatedSystemData);
}

// Backward compatibility alias
export const calculateAndSaveStepTotals = calculateAndSaveSystemTotals;
