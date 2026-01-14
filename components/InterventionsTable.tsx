import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Columns, Plus, BarChart3, Settings, RefreshCw, Sparkles } from 'lucide-react';
import { InterventionData } from '@/lib/types';
import { InterventionsDataTable } from '@/components/interventions-table';
import { SystemIndicators } from '@/components/SystemIndicators';

interface InterventionsTableProps {
  interventions?: InterventionData[];
  updateIntervention?: (id: string, field: string, value: any) => void;
  surface?: number; // en hectares
  startYear?: number;
  endYear?: number;
  onCellFocus?: (interventionId: string, interventionName: string, columnName: string) => void;
  onCellBlur?: () => void;
  onCellChange?: (interventionName: string, columnName: string, oldValue: any, newValue: any) => void;
  // New props for InterventionsDataTable
  systemData?: any;
  systemId?: string;
  onUpdate?: (updatedData?: any) => void;
  onCellFocusAI?: (stepIndex: number, interventionIndex: number, indicatorKey: string) => void;
  // Props for batch calculation
  onCalculateAllMissing?: () => void;
  isBatchCalculating?: boolean;
}

export function InterventionsTable({ 
  surface = 15, 
  startYear = 2027, 
  endYear = 2033, 
  onCellFocus, 
  onCellBlur, 
  onCellChange,
  systemData,
  systemId,
  onUpdate,
  onCellFocusAI,
  onCalculateAllMissing,
  isBatchCalculating = false,
}: InterventionsTableProps) {
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


  // Calculate surface from systemData if available
  const systemSurface = systemData?.surface || surface;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2>Indicateurs technico-économiques</h2>
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

          {onCalculateAllMissing && (
            <button
              onClick={onCalculateAllMissing}
              disabled={isBatchCalculating}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Calculer tous les indicateurs manquants"
            >
              <Sparkles className="size-5" />
              {isBatchCalculating ? 'Calcul en cours...' : 'Calculer tout'}
            </button>
          )}

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

      {/* System Indicators */}
      {systemData && (
        <SystemIndicators 
          systemData={systemData}
          visibleIndicators={visibleIndicators}
          compareMode={compareVersions}
        />
      )}

      {/* Table des interventions basée sur systemData */}
      {systemData && systemId && onUpdate && onCellFocusAI && (
        <InterventionsDataTable 
          systemData={systemData} 
          systemId={systemId}
          onUpdate={onUpdate}
          onCellFocus={onCellFocusAI}
        />
      )}
    </div>
  );
}