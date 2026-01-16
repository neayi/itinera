import { getRotationDurationYears } from '@/lib/calculate-rotation-duration';

/**
 * Calculate all totals in the system data (PURE FUNCTION - no DB access)
 * This function computes:
 * 1. Intervention-level totals (totalProduits, totalCharges)
 * 2. Step-level totals (weighted sums + totalProduits, totalCharges, margeBrute)
 * 3. System-level totals (sum across all steps)
 * 4. System-level indicators per ha per year
 * 
 * Can be used both client-side and server-side.
 * Returns updated systemData without saving to database.
 */
export function calculateSystemTotals(systemData: any) {
  if (!systemData?.steps) {
    return systemData;
  }
  
  console.log('[calculateSystemTotals] Calculating totals for systemData:', systemData);

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
          // Preserve 'user' and 'ia' status (T003 - don't overwrite AI values)
          if (intervention.values[idx].status === 'user' || intervention.values[idx].status === 'ia') {
            return; // Keep existing value and status
          }
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
      const totalProduitsEntryForceByUser = intervention.values.find((v: any) => v.key === 'totalProduits' && v.status === 'user');
      if (!totalProduitsEntryForceByUser) {
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
    const stepLevelOnlyIndicators = ['frequence', 'rendementTMS', 'prixVente', 'totalProduits', 'margeBrute'];

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
            // For other indicators, multiply by frequency
            stepTotals[key] += value * freq;
        }
      });
    });

    // Get step-level values
    const totalProduitsForcedByUser = step.values?.find((v: any) => v.key === 'totalProduits' && v.status === 'user');

    if (!totalProduitsForcedByUser) {
        const existingRendementTMS = step.values?.find((v: any) => v.key === 'rendementTMS');
        const existingPrixVente = step.values?.find((v: any) => v.key === 'prixVente');
        // Use step-level forced values if they exist
        if (existingRendementTMS) {
            stepTotals.rendementTMS = parseFloat(existingRendementTMS.value) || 0;
        }
        if (existingPrixVente) {
            stepTotals.prixVente = parseFloat(existingPrixVente.value) || 0;
        }

        stepTotals.totalProduits = stepTotals.rendementTMS * stepTotals.prixVente;
    }
    else {
        stepTotals.totalProduits = parseFloat(totalProduitsForcedByUser.value) || 0;
    }

    // Calculate step-level margeBrute: totalProduits - totalCharges
    stepTotals.margeBrute = stepTotals.totalProduits - stepTotals.totalCharges;

    // Convert to values array format with status='calculated'
    const stepValues = Object.entries(stepTotals).map(([key, value]) => {
      // Preserve user-forced values and AI values (T003-T004)
      const existingEntry = step.values?.find(
        (v: any) => v.key === key && (v.status === 'user' || v.status === 'ia' || v.status === 'n/a')
      );
      if (existingEntry) {
        return existingEntry; // Keep user/AI/n/a value with original status
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

  // LEVEL 4: Calculate system-level indicators per ha per year
  const nbYears = getRotationDurationYears(systemData);
  
  const systemIndicators = {
    // Totals (sum across all steps)
    tempsTravail: systemTotals.tempsTravail,
    ges: systemTotals.ges,
    ift: systemTotals.ift,
    azoteMineral: systemTotals.azoteMineral,
    azoteOrganique: systemTotals.azoteOrganique,
    azoteTotal: systemTotals.azoteMineral + systemTotals.azoteOrganique,
    semences: systemTotals.semences,
    totalCharges: systemTotals.totalCharges,
    totalProduits: systemTotals.totalProduits,
    margeBrute: systemTotals.margeBrute,
    
    // Per ha per year indicators
    tempsTravailParHaParAn: systemTotals.tempsTravail / nbYears,
    gesParHaParAn: systemTotals.ges / nbYears,
    iftMoyenParAn: systemTotals.ift / nbYears,
    azoteTotalParHaParAn: (systemTotals.azoteMineral + systemTotals.azoteOrganique) / nbYears,
    semencesParHaParAn: systemTotals.semences / nbYears,
    chargesParHaParAn: systemTotals.totalCharges / nbYears,
    margeBruteParHaParAn: systemTotals.margeBrute / nbYears,
    
    // Percentage
    margePercentage: systemTotals.totalProduits > 0 
      ? (systemTotals.margeBrute / systemTotals.totalProduits) * 100 
      : 0,
    
    // Meta info
    nbYears,
  };

  return {
    ...systemData,
    steps: updatedSteps,
    systemValues, // Store system-level totals (raw values)
    systemIndicators, // Store system-level indicators (per ha per year + percentages)
  };
}

