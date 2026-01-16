import { query } from '@/lib/db';
import { calculateSystemTotals } from './calculate-system-totals';

/**
 * Save system data to database (SERVER-SIDE ONLY)
 * This function persists the system data to the database.
 */
export async function saveSystemTotals(systemId: string, systemData: any) {
  await query(
    'UPDATE systems SET json = ?, updated_at = NOW() WHERE id = ?',
    [JSON.stringify(systemData), systemId]
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
