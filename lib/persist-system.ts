import { query } from '@/lib/db';
import { calculateSystemTotals } from './calculate-system-totals';
import { getRotationDurationYears } from './calculate-rotation-duration';

/**
 * Extract summary values from systemData for database storage
 */
function extractSummaryValues(systemData: any): {
  eiq: number | null;
  gross_margin: number | null;
  duration: number | null;
} {
  try {
    const duration = systemData.systemIndicators?.nbYears ?? 0;
    const eiq = systemData.systemIndicators?.eiq ?? systemData.systemValues?.find((v: any) => v.key === 'eiq')?.value ?? null;
    const gross_margin = systemData.systemIndicators?.margeBruteParHaParAn ?? 0;

    return {
      eiq: eiq !== null ? Number(eiq) : null,
      gross_margin: gross_margin,
      duration: duration !== null ? Number(duration) : null,
    };
  } catch (error) {
    console.error('Error extracting summary values:', error);
    return { eiq: null, gross_margin: null, duration: null };
  }
}

/**
 * Save system data to database (SERVER-SIDE ONLY)
 * This function persists the system data to the database.
 */
export async function saveSystemTotals(systemId: string, systemData: any) {
  const { eiq, gross_margin, duration } = extractSummaryValues(systemData);

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
