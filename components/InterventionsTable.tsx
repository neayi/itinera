import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Columns, Plus, BarChart3, Settings, RefreshCw } from 'lucide-react';
import { InterventionData } from '@/lib/types';

interface InterventionsTableProps {
  interventions: InterventionData[];
  updateIntervention: (id: string, field: string, value: any) => void;
  surface?: number; // en hectares
  startYear?: number;
  endYear?: number;
  onCellFocus?: (interventionId: string, interventionName: string, columnName: string) => void;
  onCellBlur?: () => void;
  onCellChange?: (interventionName: string, columnName: string, oldValue: any, newValue: any) => void;
}

export function InterventionsTable({ surface = 15, startYear = 2027, endYear = 2033, onCellFocus, onCellBlur, onCellChange }: InterventionsTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [focusedCell, setFocusedCell] = useState<{ interventionId: string; columnName: string; initialValue: any } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(['intervention', 'description', 'produit', 'date', 'frequence', 'semences', 'engrais', 'unitesMineral', 'azoteOrganique', 'oligos', 'phytos', 'ift', 'hri1', 'mecanisation', 'irrigation', 'workTime', 'gnr', 'ges', 'charges', 'prixVente', 'margeBrute'])
  );
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const columnSelectorRef = useRef<HTMLDivElement>(null);

  const [visibleIndicators, setVisibleIndicators] = useState<Set<string>>(
    new Set(['charges', 'workTime', 'ges', 'ift', 'azote', 'semences', 'margeBrute'])
  );
  const [showIndicatorSelector, setShowIndicatorSelector] = useState(false);
  const indicatorSelectorRef = useRef<HTMLDivElement>(null);

  const [compareVersions, setCompareVersions] = useState(false);

  // Close column selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnSelectorRef.current && !columnSelectorRef.current.contains(event.target as Node)) {
        setShowColumnSelector(false);
      }
      if (indicatorSelectorRef.current && !indicatorSelectorRef.current.contains(event.target as Node)) {
        setShowIndicatorSelector(false);
      }
    };

    if (showColumnSelector || showIndicatorSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnSelector, showIndicatorSelector]);

  const toggleColumn = (columnKey: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  const toggleIndicator = (indicatorKey: string) => {
    setVisibleIndicators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(indicatorKey)) {
        newSet.delete(indicatorKey);
      } else {
        newSet.add(indicatorKey);
      }
      return newSet;
    });
  };

  const showAgronomicColumns = () => {
    setVisibleColumns(new Set(['intervention', 'description', 'produit', 'date', 'frequence', 'unitesMineral', 'azoteOrganique', 'oligos']));
  };

  const showEnvironmentalColumns = () => {
    setVisibleColumns(new Set(['intervention', 'description', 'produit', 'phytos', 'ift', 'hri1', 'ges', 'workTime']));
  };

  const showFinancialColumns = () => {
    setVisibleColumns(new Set(['intervention', 'description', 'produit', 'semences', 'engrais', 'mecanisation', 'gnr', 'irrigation', 'charges', 'prixVente', 'margeBrute']));
  };

  const availableColumns = [
    { key: 'description', label: 'Description' },
    { key: 'produit', label: 'Produits' },
    { key: 'date', label: 'Date' },
    { key: 'frequence', label: 'Fréquence' },
    { key: 'semences', label: 'Semences' },
    { key: 'engrais', label: 'Engrais' },
    { key: 'unitesMineral', label: 'U. minéral (N)' },
    { key: 'azoteOrganique', label: 'Azote organique' },
    { key: 'oligos', label: 'Oligos' },
    { key: 'phytos', label: 'Phytos' },
    { key: 'ift', label: 'IFT' },
    { key: 'hri1', label: 'HRI1' },
    { key: 'mecanisation', label: 'Mécanisation' },
    { key: 'irrigation', label: 'Irrigation' },
    { key: 'workTime', label: 'Temps de travail' },
    { key: 'gnr', label: 'GNR' },
    { key: 'ges', label: 'GES' },
    { key: 'charges', label: 'Charges' },
    { key: 'prixVente', label: 'Prix de vente' },
    { key: 'margeBrute', label: 'Marge brute' },
  ];

  const availableIndicators = [
    { key: 'charges', label: 'Charges totales' },
    { key: 'workTime', label: 'Temps de travail' },
    { key: 'ges', label: 'Émissions GES' },
    { key: 'ift', label: 'IFT moyen' },
    { key: 'azote', label: 'Azote total' },
    { key: 'semences', label: 'Semences' },
    { key: 'margeBrute', label: 'Marge brute' },
  ];


  // Calculate grand totals
  const grandTotals = 
    { cost: 0, workTime: 0, ges: 0, charges: 0, semences: 0, engrais: 0, unitesMineral: 0, azoteOrganique: 0, oligos: 0, phytos: 0, ift: 0, hri1: 0, mecanisation: 0, irrigation: 0, gnr: 0, prixVente: 0, margeBrute: 0 };

  // Calculate marge brute per hectare per year
  const nbYears = endYear - startYear + 1;
  const margeBrutePerHaPerYear = grandTotals.margeBrute / (surface * nbYears);

  // Calculate total produits (charges + marge brute) to get margin percentage
  const totalProduits = grandTotals.charges + grandTotals.margeBrute;
  const margePercentage = totalProduits > 0 ? (grandTotals.margeBrute / totalProduits) * 100 : 0;

  // Calculate IFT moyen par an
  const iftMoyenParAn = grandTotals.ift / nbYears;

  // Calculate NPK total par hectare par an (N = azote minéral + azote organique)
  const azoteTotalParHaParAn = (grandTotals.unitesMineral + grandTotals.azoteOrganique) / (surface * nbYears);

  // Mock data for Variante 1 (slightly different values for comparison)
  const variante1Totals = {
    workTime: grandTotals.workTime * 0.85, // 15% reduction
    ges: grandTotals.ges * 0.92, // 8% reduction
    ift: grandTotals.ift * 0.78, // 22% reduction
    semences: grandTotals.semences * 1.05, // 5% increase
    charges: grandTotals.charges * 0.95, // 5% reduction
    margeBrute: grandTotals.margeBrute * 1.08, // 8% increase
  };

  const variante1IftMoyenParAn = variante1Totals.ift / nbYears;
  const variante1AzoteTotalParHaParAn = azoteTotalParHaParAn * 0.90; // 10% reduction
  const variante1MargeBrutePerHaPerYear = variante1Totals.margeBrute / (surface * nbYears);
  const variante1TotalProduits = variante1Totals.charges + variante1Totals.margeBrute;
  const variante1MargePercentage = variante1TotalProduits > 0 ? (variante1Totals.margeBrute / variante1TotalProduits) * 100 : 0;

  // Helper function to get background color based on focus state
  const getInputBgClass = (interventionId: string, columnName: string, defaultBg: string = 'bg-transparent') => {
    if (focusedCell && focusedCell.interventionId === interventionId && focusedCell.columnName === columnName) {
      return 'bg-[#e3e8fc]';
    }
    return defaultBg;
  };

  // Handler for cell focus
  const handleCellFocus = (interventionId: string, interventionName: string, columnName: string, initialValue?: any) => {
    setFocusedCell({ interventionId, columnName, initialValue });
    onCellFocus?.(interventionId, interventionName, columnName);
  };

  // Handler for cell blur - check if the related target is in the chatbot
  const handleCellBlur = (e?: React.FocusEvent) => {
    // Use setTimeout to defer the blur check, allowing us to detect the newly focused element
    setTimeout(() => {
      // Check if the newly focused element is inside the chatbot
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.closest('[data-chatbot="true"]')) {
        // Don't blur if focus moved to chatbot
        return;
      }

      setFocusedCell(null);
      onCellBlur?.();
    }, 0);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2>Interventions et productions (/ ha / an)</h2>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-sky-100 rounded"></div>
            <span className="text-sm text-gray-700">Calcul réalisé par IA</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Comparer les versions</span>
            <button
              role="switch"
              aria-checked={compareVersions}
              onClick={() => setCompareVersions(!compareVersions)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#6b9571] focus:ring-offset-2 ${
                compareVersions ? 'bg-[#6b9571]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  compareVersions ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            className="flex items-center gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-colors text-sm"
            onClick={() => alert('Ajout d\'une ligne en cours de développement')}
          >
            <Plus className="size-4" />
            Ajouter une ligne
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-sm"
              onClick={() => setShowColumnSelector(!showColumnSelector)}
            >
              <Columns className="size-4" />
              Colonnes
            </button>

            {/* Column selector dropdown */}
            {showColumnSelector && (
              <div ref={columnSelectorRef} className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-64">
                <div className="p-4">
                  <h3 className="mb-3">Colonnes visibles</h3>

                  {/* Theme shortcuts */}
                  <div className="mb-4 flex flex-col gap-2">
                    <button
                      onClick={showAgronomicColumns}
                      className="px-3 py-2 text-sm text-left rounded bg-green-50 hover:bg-green-100 transition-colors border border-green-200"
                    >
                      🌱 Agronomique
                    </button>
                    <button
                      onClick={showEnvironmentalColumns}
                      className="px-3 py-2 text-sm text-left rounded bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      🌍 Environnemental et social
                    </button>
                    <button
                      onClick={showFinancialColumns}
                      className="px-3 py-2 text-sm text-left rounded bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200"
                    >
                      💰 Financier
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {availableColumns.map(column => (
                        <label key={column.key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={visibleColumns.has(column.key)}
                            onChange={() => toggleColumn(column.key)}
                            className="cursor-pointer"
                          />
                          <span className="text-sm">{column.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-sm"
              onClick={() => setShowIndicatorSelector(!showIndicatorSelector)}
            >
              <BarChart3 className="size-4" />
              Indicateurs
            </button>

            {/* Indicator selector dropdown */}
            {showIndicatorSelector && (
              <div ref={indicatorSelectorRef} className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-64">
                <div className="p-4">
                  <h3 className="mb-3">Indicateurs visibles</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableIndicators.map(indicator => (
                      <label key={indicator.key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={visibleIndicators.has(indicator.key)}
                          onChange={() => toggleIndicator(indicator.key)}
                        />
                        <span className="text-sm">{indicator.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {(() => {
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
            {/* Originale indicators */}
            <div>
              {compareVersions && (
                <div className="text-sm mb-2 px-1">
                  <span className="bg-[#6b9571] text-white px-3 py-1 rounded">Originale</span>
                </div>
              )}
              <div className={`grid ${gridColsClass} gap-4`}>
            {visibleIndicators.has('workTime') && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Temps de travail</div>
                <div className="text-2xl mt-1">{grandTotals.workTime.toFixed(1)} h <span className="text-sm text-gray-600">/ha/an</span></div>
              </div>
            )}
            {visibleIndicators.has('ges') && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Émissions GES</div>
                <div className="text-2xl mt-1">{grandTotals.ges.toFixed(0)} kg <span className="text-sm text-gray-600">/ha/an</span></div>
              </div>
            )}
            {visibleIndicators.has('ift') && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">IFT moyen</div>
                <div className="text-2xl mt-1">{iftMoyenParAn > 0 ? iftMoyenParAn.toFixed(2) : '0'} <span className="text-sm text-gray-600">par an</span></div>
              </div>
            )}
            {visibleIndicators.has('azote') && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Azote total</div>
                <div className="text-2xl mt-1">{azoteTotalParHaParAn > 0 ? azoteTotalParHaParAn.toFixed(0) : '0'} N <span className="text-sm text-gray-600">/ha/an</span></div>
              </div>
            )}
            {visibleIndicators.has('semences') && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Semences</div>
                <div className="text-2xl mt-1">{grandTotals.semences > 0 ? `${grandTotals.semences.toFixed(0)} €` : '0 €'} <span className="text-sm text-gray-600">/ha/an</span></div>
              </div>
            )}
            {visibleIndicators.has('charges') && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Charges totales</div>
                <div className="text-2xl mt-1">{grandTotals.charges.toFixed(0)} € <span className="text-sm text-gray-600">/ha/an</span></div>
              </div>
            )}
            {visibleIndicators.has('margeBrute') && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Marge brute</div>
                <div className="text-2xl mt-1">
                  {margeBrutePerHaPerYear > 0 ? `${margeBrutePerHaPerYear.toFixed(0)} €` : '0 €'} <span className="text-sm text-gray-600">/ha/an</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{margePercentage.toFixed(1)}%</div>
              </div>
            )}
              </div>
            </div>

            {/* Variante 1 indicators (only show in compare mode) */}
            {compareVersions && (
              <div>
                <div className="text-sm mb-2 px-1">
                  <span className="bg-[#8b7355] text-white px-3 py-1 rounded">Variante 1</span>
                </div>
                <div className={`grid ${gridColsClass} gap-4`}>
                  {visibleIndicators.has('workTime') && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Temps de travail</div>
                      <div className="text-2xl mt-1">{variante1Totals.workTime.toFixed(1)} h <span className="text-sm text-gray-600">/ha/an</span></div>
                      <div className="text-xs text-green-600 mt-1">-{((1 - variante1Totals.workTime/grandTotals.workTime) * 100).toFixed(0)}%</div>
                    </div>
                  )}
                  {visibleIndicators.has('ges') && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Émissions GES</div>
                      <div className="text-2xl mt-1">{variante1Totals.ges.toFixed(0)} kg <span className="text-sm text-gray-600">/ha/an</span></div>
                      <div className="text-xs text-green-600 mt-1">-{((1 - variante1Totals.ges/grandTotals.ges) * 100).toFixed(0)}%</div>
                    </div>
                  )}
                  {visibleIndicators.has('ift') && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600">IFT moyen</div>
                      <div className="text-2xl mt-1">{variante1IftMoyenParAn > 0 ? variante1IftMoyenParAn.toFixed(2) : '0'} <span className="text-sm text-gray-600">par an</span></div>
                      <div className="text-xs text-green-600 mt-1">-{((1 - variante1Totals.ift/grandTotals.ift) * 100).toFixed(0)}%</div>
                    </div>
                  )}
                  {visibleIndicators.has('azote') && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Azote total</div>
                      <div className="text-2xl mt-1">{variante1AzoteTotalParHaParAn > 0 ? variante1AzoteTotalParHaParAn.toFixed(0) : '0'} N <span className="text-sm text-gray-600">/ha/an</span></div>
                      <div className="text-xs text-green-600 mt-1">-{((1 - variante1AzoteTotalParHaParAn/azoteTotalParHaParAn) * 100).toFixed(0)}%</div>
                    </div>
                  )}
                  {visibleIndicators.has('semences') && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Semences</div>
                      <div className="text-2xl mt-1">{variante1Totals.semences > 0 ? `${variante1Totals.semences.toFixed(0)} €` : '0 €'} <span className="text-sm text-gray-600">/ha/an</span></div>
                      <div className="text-xs text-orange-600 mt-1">+{((variante1Totals.semences/grandTotals.semences - 1) * 100).toFixed(0)}%</div>
                    </div>
                  )}
                  {visibleIndicators.has('charges') && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Charges totales</div>
                      <div className="text-2xl mt-1">{variante1Totals.charges.toFixed(0)} € <span className="text-sm text-gray-600">/ha/an</span></div>
                      <div className="text-xs text-green-600 mt-1">-{((1 - variante1Totals.charges/grandTotals.charges) * 100).toFixed(0)}%</div>
                    </div>
                  )}
                  {visibleIndicators.has('margeBrute') && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Marge brute</div>
                      <div className="text-2xl mt-1">
                        {variante1MargeBrutePerHaPerYear > 0 ? `${variante1MargeBrutePerHaPerYear.toFixed(0)} €` : '0 €'} <span className="text-sm text-gray-600">/ha/an</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{variante1MargePercentage.toFixed(1)}%</div>
                      <div className="text-xs text-green-600 mt-1">+{((variante1Totals.margeBrute/grandTotals.margeBrute - 1) * 100).toFixed(0)}%</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
}