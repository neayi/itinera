import { getRotationDurationYears } from '@/lib/calculate-rotation-duration';
import { IndicatorFactory, type FieldKey } from '@/lib/ai/indicators';

/**
 * Calculate step-level totals for a given step
 * Uses IndicatorFactory to get values with proper weighting
 * Stores calculated values in systemData.steps[stepIndex].values[]
 * Returns an object with all indicator totals for this step
 */
export function calculateStepTotals(systemData: any, stepIndex: number) {
  const step = systemData.steps[stepIndex];

  const stepTotals: Record<string, number> = {
    azoteMineral: 0,
    azoteOrganique: 0,
    rendementTMS: 0,
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
    totalProduits: 0,
    totalCharges: 0,
    prixVente: 0,
    margeBrute: 0,
  };

  // Indicators that can have step-level overrides
  const stepLevelEditableFields = ['irrigation', 'rendementTMS', 'prixVente', 'totalProduits'];

  // Check for step-level forced values first
  stepLevelEditableFields.forEach((field) => {
    const indicator = IndicatorFactory.create(field as FieldKey, { systemData, stepIndex });
    const status = indicator.getStatus();
    const value = indicator.getRawValue();

    if (status === 'user' && value !== null && typeof value === 'number') {
      stepTotals[field] = typeof value === 'number' ? value : 0;
    }
  });

  // Calculate weighted sums from interventions
  if (step.interventions && Array.isArray(step.interventions)) {
    step.interventions.forEach((_intervention: any, interventionIndex: number) => {
      // Get weighted values for all indicators
      const indicators = [
        'azoteMineral', 'azoteOrganique', 'ift', 'eiq', 'ges', 'tempsTravail',
        'coutsPhytos', 'semences', 'engrais', 'mecanisation', 'gnr'
      ];

      indicators.forEach((key) => {
        const indicator = IndicatorFactory.create(key as FieldKey, { systemData, stepIndex, interventionIndex });
        stepTotals[key] += indicator.getWeightedValue();
      });

      // For step-editable fields, only sum if no step-level override
      stepLevelEditableFields.forEach((field) => {
        const indicator = IndicatorFactory.create(field as FieldKey, { systemData, stepIndex, interventionIndex });
        stepTotals[field] += indicator.getWeightedValue();
      });
    });
  }

  stepLevelEditableFields.forEach((field) => {
    const stepIndicator = IndicatorFactory.create(field as FieldKey, { systemData, stepIndex });
    const totalIndicatorValue = stepIndicator.getRawValue();

    if (stepIndicator.getStatus() === 'user' && totalIndicatorValue !== null && totalIndicatorValue !== 0) {
      // Step-level user value exists, do not sum intervention values
      stepTotals[field] = totalIndicatorValue || 0;
    }
  });

  // Calculate totalCharges (sum of cost indicators)
  stepTotals.totalCharges =
    stepTotals.coutsPhytos +
    stepTotals.semences +
    stepTotals.engrais +
    stepTotals.mecanisation +
    stepTotals.gnr +
    stepTotals.irrigation;

  // Calculate totalProduits
  const totalProduitsIndicator = IndicatorFactory.create('totalProduits', { systemData, stepIndex });
  const totalProduitsValue = totalProduitsIndicator.getRawValue();

  if (totalProduitsIndicator.getStatus() === 'user' && totalProduitsValue !== null && totalProduitsValue !== 0) {
    // User-forced non-zero value
    stepTotals.totalProduits = typeof totalProduitsValue === 'number' ? totalProduitsValue : 0;
  } else {
    // Calculate: rendementTMS * prixVente
    stepTotals.totalProduits = stepTotals.rendementTMS * stepTotals.prixVente;
  }

  // Calculate margeBrute
  stepTotals.margeBrute = stepTotals.totalProduits - stepTotals.totalCharges;

  // Store calculated values in systemData.steps[stepIndex].values[]
  if (!step.values) {
    step.values = [];
  }

  Object.entries(stepTotals).forEach(([key, value]) => {
    const existingIndex = step.values.findIndex((v: any) => v.key === key);

    if (existingIndex >= 0) {
      // Only update if not user/ia/n/a status
      const existingStatus = step.values[existingIndex].status;
      if (existingStatus !== 'user' && existingStatus !== 'ia' && existingStatus !== 'n/a') {
        step.values[existingIndex].value = value;
        step.values[existingIndex].status = 'calculated';
      }
    } else {
      // Add new calculated value
      step.values.push({
        key,
        value,
        status: 'calculated'
      });
    }
  });

  return stepTotals;
}

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

  const updatedSteps = systemData.steps.map((step: any, stepIndex: number) => {
    // LEVEL 1: Calculate intervention-level totals
    const updatedInterventions = step.interventions?.map((intervention: any, interventionIndex: number) => {
      if (!intervention.values) {
        intervention.values = [];
      }

      // Helper to get value using IndicatorFactory
      const getValue = (key: string): number => {
        try {
          const indicator = IndicatorFactory.create(key as FieldKey, {
            systemData,
            stepIndex,
            interventionIndex
          });
          const value = indicator.getRawValue();
          if (value === null || value === undefined || typeof value === 'string') return 0;
          return value;
        } catch (e) {
          return 0;
        }
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
        } else {
          intervention.values.push({
            key,
            value,
            status,
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

    // LEVEL 2: Calculate step-level totals using the new function
    const stepTotals = calculateStepTotals(systemData, stepIndex);

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
  }));

  // LEVEL 4: Calculate system-level indicators per ha per year
  const nbYears = getRotationDurationYears(systemData);

  const systemIndicators = {
    // Totals (sum across all steps)
    tempsTravail: systemTotals.tempsTravail,
    ges: systemTotals.ges,
    ift: systemTotals.ift,
    eiq: systemTotals.eiq,
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
    eiqParHaParAn: systemTotals.eiq / nbYears,
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

