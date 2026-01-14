import { query } from '@/lib/db';

/**
 * Calculate and save step-level totals in the system data
 * This function computes totals from interventions and stores them in step.values[]
 */
export async function calculateAndSaveStepTotals(systemId: string, systemData: any) {
  if (!systemData?.steps) {
    return systemData;
  }

  const updatedSteps = systemData.steps.map((step: any) => {
    // Calculate totals for this step
    const stepTotals: Record<string, number> = {
      frequence: 0,
      azoteMineral: 0,
      azoteOrganique: 0,
      ift: 0,
      eiq: 0,
      ges: 0,
      tempsTravail: 0,
      coutsPhytos: 0,
      semences: 0,
      engrais: 0,
      mecanisation: 0,
      gnr: 0,
      irrigation: 0,
      totalCharges: 0,
      // These indicators are only at step level, not summed from interventions:
      rendementTMS: 0,
      prixVente: 0,
      totalProduits: 0,
      margeBrute: 0,
    };

    // Step-level indicators that should not be summed from interventions
    const stepLevelOnlyIndicators = ['rendementTMS', 'prixVente', 'totalProduits', 'margeBrute'];

    if (step.interventions && Array.isArray(step.interventions)) {
      step.interventions.forEach((intervention: any) => {
        if (!intervention.values) return;

        // Get frequency for weighted sum
        const freqEntry = intervention.values.find((v: any) => v.key === 'frequence');
        const freq = freqEntry?.value || 1;

        // Sum all indicators weighted by frequency (except step-level only indicators)
        intervention.values.forEach((valueEntry: any) => {
          const key = valueEntry.key;
          const value = parseFloat(valueEntry.value) || 0;

          // Skip step-level only indicators
          if (stepLevelOnlyIndicators.includes(key)) return;

          if (key in stepTotals) {
            // For frequence, just sum without multiplying
            if (key === 'frequence') {
              stepTotals[key] += value;
            } else {
              // For other indicators, multiply by frequency
              stepTotals[key] += value * freq;
            }
          }
        });
      });
    }

    // Calculate derived totals
    stepTotals.totalCharges = 
      stepTotals.coutsPhytos +
      stepTotals.semences +
      stepTotals.engrais +
      stepTotals.mecanisation +
      stepTotals.gnr +
      stepTotals.irrigation;

    // Get step-level values for rendementTMS, prixVente, and totalProduits
    const existingRendementTMS = step.stepValues?.find((v: any) => v.key === 'rendementTMS');
    const existingPrixVente = step.stepValues?.find((v: any) => v.key === 'prixVente');
    const existingTotalProduits = step.stepValues?.find((v: any) => v.key === 'totalProduits');

    // Use step-level values if they exist
    if (existingRendementTMS) {
      stepTotals.rendementTMS = parseFloat(existingRendementTMS.value) || 0;
    }
    if (existingPrixVente) {
      stepTotals.prixVente = parseFloat(existingPrixVente.value) || 0;
    }

    // Calculate totalProduits: use forced value if exists and non-zero, otherwise calculate
    if (existingTotalProduits && existingTotalProduits.value !== 0) {
      stepTotals.totalProduits = parseFloat(existingTotalProduits.value) || 0;
    } else {
      stepTotals.totalProduits = stepTotals.rendementTMS * stepTotals.prixVente;
    }

    // Calculate margeBrute at step level: totalProduits - totalCharges
    stepTotals.margeBrute = stepTotals.totalProduits - stepTotals.totalCharges;

    // Convert to values array format
    const stepValues = Object.entries(stepTotals).map(([key, value]) => ({
      key,
      value,
      reviewed: true, // Step totals are calculated, mark as reviewed
    }));

    return {
      ...step,
      values: stepValues,
    };
  });

  const updatedSystemData = {
    ...systemData,
    steps: updatedSteps,
  };

  // Save to database
  await query(
    'UPDATE systems SET json = ?, updated_at = NOW() WHERE id = ?',
    [JSON.stringify(updatedSystemData), systemId]
  );

  return updatedSystemData;
}
