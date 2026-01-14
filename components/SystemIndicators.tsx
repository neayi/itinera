'use client';

import React from 'react';

interface SystemIndicatorsProps {
  systemData: any;
  visibleIndicators: Set<string>;
  compareMode?: boolean;
  variantData?: any; // Optional data for comparison variant
}

export function SystemIndicators({
  systemData,
  visibleIndicators,
  compareMode = false,
  variantData,
}: SystemIndicatorsProps) {
  
  // Calculate totals from system data
  const calculateTotals = (data: any) => {
    const totals = {
      workTime: 0,
      ges: 0,
      ift: 0,
      azoteMineral: 0,
      azoteOrganique: 0,
      semences: 0,
      engrais: 0,
      coutsPhytos: 0,
      mecanisation: 0,
      irrigation: 0,
      gnr: 0,
      totalCharges: 0,
      totalProduits: 0,
      margeBrute: 0,
    };

    if (!data?.steps) return totals;

    console.log('[SystemIndicators] Calculating totals for', data.steps.length, 'steps');

    // Sum values from step totals
    data.steps.forEach((step: any, stepIndex: number) => {
      // First, calculate step totals from interventions if step.values doesn't exist
      const stepTotals: any = {};
      
      if (step.interventions) {
        step.interventions.forEach((intervention: any) => {
          if (!intervention.values) return;

          intervention.values.forEach((valueEntry: any) => {
            const key = valueEntry.key;
            const value = parseFloat(valueEntry.value) || 0;
            
            if (!stepTotals[key]) {
              stepTotals[key] = 0;
            }
            stepTotals[key] += value;
          });
        });
      }

      // Use step.values if exists, otherwise use calculated stepTotals
      const valuesToUse = step.values && step.values.length > 0 ? step.values : 
        Object.entries(stepTotals).map(([key, value]) => ({ key, value }));

      console.log(`[SystemIndicators] Step ${stepIndex} (${step.name}):`, valuesToUse.length, 'values');

      valuesToUse.forEach((valueEntry: any) => {
        const key = valueEntry.key;
        const value = parseFloat(valueEntry.value) || 0;

        if (key === 'margeBrute' || key === 'totalProduits') {
          console.log(`[SystemIndicators] Step ${stepIndex} ${key}:`, value);
        }

        // Map indicator keys to totals
        switch (key) {
          case 'tempsTravail':
            totals.workTime += value;
            break;
          case 'ges':
            totals.ges += value;
            break;
          case 'ift':
            totals.ift += value;
            break;
          case 'azoteMineral':
            totals.azoteMineral += value;
            break;
          case 'azoteOrganique':
            totals.azoteOrganique += value;
            break;
          case 'semences':
            totals.semences += value;
            break;
          case 'engrais':
            totals.engrais += value;
            break;
          case 'coutsPhytos':
            totals.coutsPhytos += value;
            break;
          case 'mecanisation':
            totals.mecanisation += value;
            break;
          case 'irrigation':
            totals.irrigation += value;
            break;
          case 'gnr':
            totals.gnr += value;
            break;
          case 'totalCharges':
            totals.totalCharges += value;
            break;
          case 'totalProduits':
            totals.totalProduits += value;
            break;
          case 'margeBrute':
            totals.margeBrute += value;
            break;
        }
      });
    });

    console.log('[SystemIndicators] Final totals:', {
      margeBrute: totals.margeBrute,
      totalProduits: totals.totalProduits,
      totalCharges: totals.totalCharges
    });

    return totals;
  };

  const totals = calculateTotals(systemData);

  // Calculate rotation duration in years
  const getRotationDurationYears = (data: any) => {
    if (!data?.steps || data.steps.length === 0) return 1;

    let startDate: Date | null = null;
    let endDate: Date | null = null;

    // We don't know if the steps are sorted, so reduce the dates out of all steps
    data.steps.forEach((step: any) => {
      if (step.startDate) {
        const stepStart = new Date(step.startDate);
        if (startDate === null || stepStart < startDate) {
          startDate = stepStart;
        }
      }
      if (step.endDate) {
        const stepEnd = new Date(step.endDate);
        if (endDate === null || stepEnd > endDate) {
          endDate = stepEnd;
        }
      }
    });

    const durationMs = endDate !== null && startDate !== null ? endDate.getTime() - startDate.getTime() : 0;
    const durationDays = durationMs / (1000 * 60 * 60 * 24);
    const durationYears = durationDays / 365.25;

    return Math.max(durationYears, 1);
  };

  const nbYears = getRotationDurationYears(systemData);

  // Calculate per hectare per year values
  const workTimePerHaPerYear = totals.workTime / nbYears;
  const gesPerHaPerYear = totals.ges / nbYears;
  const iftMoyenParAn = totals.ift / nbYears;
  const azoteTotalPerHaPerYear = (totals.azoteMineral + totals.azoteOrganique) / nbYears;
  const semencesPerHaPerYear = totals.semences / nbYears;
  const chargesPerHaPerYear = totals.totalCharges / nbYears;
  const margeBrutePerHaPerYear = totals.margeBrute / nbYears;

  // Calculate margin percentage
  const margePercentage = totals.totalProduits > 0 ? (totals.margeBrute / totals.totalProduits) * 100 : 0;

  // Calculate variant totals if in compare mode
  let variantTotals = null;
  let variantNbYears = nbYears;
  if (compareMode && variantData) {
    variantTotals = calculateTotals(variantData);
    variantNbYears = getRotationDurationYears(variantData);
  }

  const visibleCount = visibleIndicators.size;
  const gridColsClass = visibleCount === 1 ? 'grid-cols-1'
    : visibleCount === 2 ? 'grid-cols-2'
    : visibleCount === 3 ? 'grid-cols-3'
    : visibleCount === 4 ? 'grid-cols-4'
    : visibleCount === 5 ? 'grid-cols-5'
    : visibleCount === 6 ? 'grid-cols-6'
    : 'grid-cols-7';

  return (
    <div className="space-y-4 mb-4">
      {/* Current system indicators */}
      <div>
        {compareMode && (
          <div className="text-sm mb-2 px-1">
            <span className="bg-[#6b9571] text-white px-3 py-1 rounded">Système actuel</span>
          </div>
        )}
        <div className={`grid ${gridColsClass} gap-4`}>
          {visibleIndicators.has('workTime') && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">Temps de travail</div>
              <div className="text-2xl mt-1">
                {workTimePerHaPerYear.toFixed(1)} h <span className="text-sm text-gray-600">/ha/an</span>
              </div>
            </div>
          )}
          {visibleIndicators.has('ges') && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">Émissions GES</div>
              <div className="text-2xl mt-1">
                {gesPerHaPerYear.toFixed(0)} kg <span className="text-sm text-gray-600">/ha/an</span>
              </div>
            </div>
          )}
          {visibleIndicators.has('ift') && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">IFT moyen</div>
              <div className="text-2xl mt-1">
                {iftMoyenParAn > 0 ? iftMoyenParAn.toFixed(2) : '0'} <span className="text-sm text-gray-600">par an</span>
              </div>
            </div>
          )}
          {visibleIndicators.has('azote') && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">Azote total</div>
              <div className="text-2xl mt-1">
                {azoteTotalPerHaPerYear > 0 ? azoteTotalPerHaPerYear.toFixed(0) : '0'} N <span className="text-sm text-gray-600">/ha/an</span>
              </div>
            </div>
          )}
          {visibleIndicators.has('semences') && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">Semences</div>
              <div className="text-2xl mt-1">
                {semencesPerHaPerYear > 0 ? `${semencesPerHaPerYear.toFixed(0)} €` : '0 €'} <span className="text-sm text-gray-600">/ha/an</span>
              </div>
            </div>
          )}
          {visibleIndicators.has('charges') && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">Charges totales</div>
              <div className="text-2xl mt-1">
                {chargesPerHaPerYear.toFixed(0)} € <span className="text-sm text-gray-600">/ha/an</span>
              </div>
            </div>
          )}
          {visibleIndicators.has('margeBrute') && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">Marge brute</div>
              <div className="text-2xl mt-1">
                {margeBrutePerHaPerYear.toFixed(0)} € <span className="text-sm text-gray-600">/ha/an</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{margePercentage.toFixed(1)}%</div>
            </div>
          )}
        </div>
      </div>

      {/* Variant indicators (only in compare mode) */}
      {compareMode && variantTotals && (
        <div>
          <div className="text-sm mb-2 px-1">
            <span className="bg-[#8b7355] text-white px-3 py-1 rounded">Variante</span>
          </div>
          <div className={`grid ${gridColsClass} gap-4`}>
            {visibleIndicators.has('workTime') && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Temps de travail</div>
                <div className="text-2xl mt-1">
                  {(variantTotals.workTime / variantNbYears).toFixed(1)} h <span className="text-sm text-gray-600">/ha/an</span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {((1 - variantTotals.workTime / totals.workTime) * 100).toFixed(0)}%
                </div>
              </div>
            )}
            {/* Add other variant indicators as needed */}
          </div>
        </div>
      )}
    </div>
  );
}
