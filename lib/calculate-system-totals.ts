import { query } from '@/lib/db';

/**
 * Calculate and save all totals in the system data
 * This function computes:
 * 1. Intervention-level totals (totalProduits, totalCharges)
 * 2. Step-level totals (weighted sums + totalProduits, totalCharges, margeBrute)
 * 3. System-level totals (sum across all steps)
 * 
 * All calculated values are stored in systemData.
 */
export async function calculateAndSaveSystemTotals(systemId: string, systemData: any) {
  if (!systemData?.steps) {
    return systemData;
  }

  // System-level totals (will be calculated from step totals)
  const systemTotals: Record<string, number> = {
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
    rendementTMS: 0,
    totalProduits: 0,
    margeBrute: 0,
  };

  const updatedSteps = systemData.steps.map((step: any) => {
    // LEVEL 1: Calculate intervention-level totals
    const updatedInterventions = step.interventions?.map((intervention: any) => {
      if (!intervention.values) {
        intervention.values = [];
      }

      // Helper to get value from intervention.values[]
      const getValue = (key: string): number => {
        const item = intervention.values.find((v: any) => v.key === key);
        return item ? (parseFloat(item.value) || 0) : 0;
      };

      // Helper to set or update value in intervention.values[]
      const setValue = (key: string, value: number, status: string = 'calculated') => {
        const idx = intervention.values.findIndex((v: any) => v.key === key);
        if (idx >= 0) {
          intervention.values[idx].value = value;
          intervention.values[idx].status = status;
          intervention.values[idx].reviewed = true;
        } else {
          intervention.values.push({
            key,
            value,
            status,
            reviewed: true,
          });
        }
      };

      // Calculate intervention-level totalProduits = prixVente × rendementTMS
      const prixVente = getValue('prixVente');
      const rendementTMS = getValue('rendementTMS');
      const calculatedTotalProduits = prixVente * rendementTMS;
      
      // Only update totalProduits if not manually set by user (status='user')
      const existingTotalProduitsEntry = intervention.values.find((v: any) => v.key === 'totalProduits');
      if (!existingTotalProduitsEntry || existingTotalProduitsEntry.status !== 'user') {
        setValue('totalProduits', calculatedTotalProduits, 'calculated');
      }

      // Calculate intervention-level totalCharges
      const totalCharges =
        getValue('coutsPhytos') +
        getValue('semences') +
        getValue('engrais') +
        getValue('mecanisation') +
        getValue('gnr') +
        getValue('irrigation');
      setValue('totalCharges', totalCharges, 'calculated');

      return intervention;
    }) || [];

    // LEVEL 2: Calculate step-level totals (weighted sums)
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
      // Step-level only indicators (not summed from interventions):
      rendementTMS: 0,
      prixVente: 0,
      totalProduits: 0,
      margeBrute: 0,
    };

    // Indicators that should not be summed from interventions
    const stepLevelOnlyIndicators = ['rendementTMS', 'prixVente', 'totalProduits', 'margeBrute'];

    // Sum values from interventions with frequency weighting
    updatedInterventions.forEach((intervention: any) => {
      if (!intervention.values) return;

      // Get frequency for weighted sum
      const freqEntry = intervention.values.find((v: any) => v.key === 'frequence');
      const freq = freqEntry?.value || 1;

      // Exclude interventions with frequency=0 (FR-016a)
      if (freq === 0) return;

      // Sum all indicators weighted by frequency
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

    // Get step-level forced values (user overrides)
    const existingRendementTMS = step.values?.find((v: any) => v.key === 'rendementTMS' && v.status === 'user');
    const existingPrixVente = step.values?.find((v: any) => v.key === 'prixVente' && v.status === 'user');
    const existingTotalProduits = step.values?.find((v: any) => v.key === 'totalProduits' && v.status === 'user');

    // Use step-level forced values if they exist
    if (existingRendementTMS) {
      stepTotals.rendementTMS = parseFloat(existingRendementTMS.value) || 0;
    }
    if (existingPrixVente) {
      stepTotals.prixVente = parseFloat(existingPrixVente.value) || 0;
    }

    // Calculate step-level totalProduits: use forced value if exists, otherwise calculate
    if (existingTotalProduits && existingTotalProduits.value !== 0) {
      stepTotals.totalProduits = parseFloat(existingTotalProduits.value) || 0;
    } else {
      stepTotals.totalProduits = stepTotals.rendementTMS * stepTotals.prixVente;
    }

    // Calculate step-level margeBrute: totalProduits - totalCharges
    stepTotals.margeBrute = stepTotals.totalProduits - stepTotals.totalCharges;

    // Convert to values array format with status='calculated'
    const stepValues = Object.entries(stepTotals).map(([key, value]) => {
      // Preserve user-forced values
      const existingEntry = step.values?.find((v: any) => v.key === key && v.status === 'user');
      if (existingEntry) {
        return existingEntry; // Keep user value with status='user'
      }

      return {
        key,
        value,
        status: 'calculated',
        reviewed: true,
      };
    });

    // LEVEL 3: Accumulate for system-level totals
    stepValues.forEach((entry: any) => {
      if (entry.key in systemTotals) {
        systemTotals[entry.key] += parseFloat(entry.value) || 0;
      }
    });

    return {
      ...step,
      interventions: updatedInterventions,
      values: stepValues,
    };
  });

  // Convert system-level totals to values array
  const systemValues = Object.entries(systemTotals).map(([key, value]) => ({
    key,
    value,
    status: 'calculated',
    reviewed: true,
  }));

  const updatedSystemData = {
    ...systemData,
    steps: updatedSteps,
    systemValues, // Store system-level totals
  };

  // Save to database
  await query(
    'UPDATE systems SET json = ?, updated_at = NOW() WHERE id = ?',
    [JSON.stringify(updatedSystemData), systemId]
  );

  return updatedSystemData;
}

// Backward compatibility alias
export const calculateAndSaveStepTotals = calculateAndSaveSystemTotals;
