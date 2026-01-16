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
  
  // Use pre-calculated indicators from systemData.systemIndicators
  // These values are computed server-side by calculate-system-totals.ts
  // and stored in the database, eliminating runtime recalculation.
  // See specs/003-indicators-ergonomics-rules/spec.md
  const indicators = systemData.systemIndicators || {};
  
  // Destructure all needed values with fallback to 0
  const {
    tempsTravailParHaParAn = 0,
    gesParHaParAn = 0,
    iftMoyenParAn = 0,
    azoteTotalParHaParAn = 0,
    semencesParHaParAn = 0,
    chargesParHaParAn = 0,
    margeBruteParHaParAn = 0,
    margePercentage = 0,
    nbYears = 1,
    // Raw totals (for comparison mode)
    tempsTravail = 0,
    ges = 0,
    totalProduits = 0,
    margeBrute = 0,
  } = indicators;

  // Get variant indicators if in compare mode
  const variantIndicators = variantData?.systemIndicators || {};

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
                {tempsTravailParHaParAn.toFixed(1)} h <span className="text-sm text-gray-600">/ha/an</span>
              </div>
            </div>
          )}
          {visibleIndicators.has('ges') && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">Émissions GES</div>
              <div className="text-2xl mt-1">
                {gesParHaParAn.toFixed(0)} kg <span className="text-sm text-gray-600">/ha/an</span>
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
                {azoteTotalParHaParAn > 0 ? azoteTotalParHaParAn.toFixed(0) : '0'} N <span className="text-sm text-gray-600">/ha/an</span>
              </div>
            </div>
          )}
          {visibleIndicators.has('semences') && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">Semences</div>
              <div className="text-2xl mt-1">
                {semencesParHaParAn > 0 ? `${semencesParHaParAn.toFixed(0)} €` : '0 €'} <span className="text-sm text-gray-600">/ha/an</span>
              </div>
            </div>
          )}
          {visibleIndicators.has('charges') && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">Charges totales</div>
              <div className="text-2xl mt-1">
                {chargesParHaParAn.toFixed(0)} € <span className="text-sm text-gray-600">/ha/an</span>
              </div>
            </div>
          )}
          {visibleIndicators.has('margeBrute') && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">Marge brute</div>
              <div className="text-2xl mt-1">
                {margeBruteParHaParAn.toFixed(0)} € <span className="text-sm text-gray-600">/ha/an</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{margePercentage.toFixed(1)}%</div>
            </div>
          )}
        </div>
      </div>

      {/* Variant indicators (only in compare mode) */}
      {compareMode && variantIndicators.tempsTravailParHaParAn !== undefined && (
        <div>
          <div className="text-sm mb-2 px-1">
            <span className="bg-[#8b7355] text-white px-3 py-1 rounded">Variante</span>
          </div>
          <div className={`grid ${gridColsClass} gap-4`}>
            {visibleIndicators.has('workTime') && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Temps de travail</div>
                <div className="text-2xl mt-1">
                  {(variantIndicators.tempsTravailParHaParAn || 0).toFixed(1)} h <span className="text-sm text-gray-600">/ha/an</span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {tempsTravail > 0 ? ((1 - (variantIndicators.tempsTravail || 0) / tempsTravail) * 100).toFixed(0) : '0'}%
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
