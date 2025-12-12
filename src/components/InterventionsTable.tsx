import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Columns, Plus, BarChart3, Settings, RefreshCw } from 'lucide-react';
import { InterventionData } from '../types';

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

export function InterventionsTable({ interventions, updateIntervention, surface = 15, startYear = 2027, endYear = 2033, onCellFocus, onCellBlur, onCellChange }: InterventionsTableProps) {
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

  const [showMecanisationTooltip, setShowMecanisationTooltip] = useState(false);
  const [showAiDetailModal, setShowAiDetailModal] = useState<string | null>(null);
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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Group interventions by category
  const groupedInterventions = interventions.reduce((acc, intervention) => {
    if (!acc[intervention.category]) {
      acc[intervention.category] = [];
    }
    acc[intervention.category].push(intervention);
    return acc;
  }, {} as Record<string, InterventionData[]>);

  // Category descriptions
  const categoryDescriptions: Record<string, string> = {
    '1 - Orge + Lupin': "Le couvert luzerne/trèfle est semé à la volée avec le combiné.\nPas de desherbage en dehors du labour.\nAprès moisson, les pailles sont laissées au sol pour restitution de MO.\nLupin vendu pour l'alimentation animale ou la production de steaks végétaux",
    '2 - Luzerne + trèfle violet et blanc': "Le couvert est semé à la volée après récolte.\nDésherbage mécanique en sortie d'hiver.\nBlé certifié AB vendu en filière boulangerie locale.",
    '3 - CIVE (Triticale)': "Semis à 100kg/ha, au combiné :\n• Cultivateur à l'avant\n• A l'arrière, fissurateur à 15cm de profondeur\n• Herse rotative\n• Ligne de semis",
    '3 - Blé tendre': "Luzerne implantée pour 3 ans en pur.\nCoupe régulière pour fauche et valorisation en foin.\nAmélioration de la structure du sol et fixation azotée.",
    '4 - Quinoa': "Rendement : 1,2 t/ha\nLabour avant le semis, éventuellement un vibro ou rouleau si le sol est séchant.\nSemis à 10kg/ha (au combiné) en monograine en 50cm d'écartement",
    '5 - Blé + féverole': "Rendement blé : 36 qx/ha\nRendement féverole : 10 qx/ha\nSemis du blé féverole en novembre en labour et combiné herse-semis avec une volonté d'implanter au moins 450grains m² en blé",
    '6 - Colza + sarrasin': "Rendement colza : 31 qx/ha\nSemis associé avec du colza (1,5kg) + sarrasin (12kg/ha) et repousse de féverole du précédent\nFauchage du colza vers le 15 juin et récolte 10 jours plus tard (30 qx/ha → huile et tourteaux)",
    '7 - Maïs grain': "Rendement : 65 qx/ha\nEpandage digestat liquide 35m³/ha à l'enfouisseur, labour et semis maïs au combiné en 50cm vers le 10 mai.\nNormalement un mois après le semis, en 50cm l'interrang est recouvert.",
    '8 - Phacélie (couvert)': "Semis rapide d'un couvert de phacélie à 10/12kg/ha"
  };

  // Calculate totals by category
  const calculateCategoryTotals = (categoryInterventions: InterventionData[]) => {
    return categoryInterventions.reduce(
      (acc, item) => ({
        cost: acc.cost + (item.cost || 0),
        workTime: acc.workTime + (item.workTime || 0),
        ges: acc.ges + (item.ges || 0),
        charges: acc.charges + (item.charges || 0),
        semences: acc.semences + (item.semences || 0),
        engrais: acc.engrais + (item.engrais || 0),
        unitesMineral: acc.unitesMineral + (item.unitesMineral || 0),
        azoteOrganique: acc.azoteOrganique + (item.azoteOrganique || 0),
        oligos: acc.oligos + (item.oligos || 0),
        phytos: acc.phytos + (item.phytos || 0),
        ift: acc.ift + (item.ift || 0),
        hri1: acc.hri1 + (item.hri1 || 0),
        mecanisation: acc.mecanisation + (item.mecanisation || 0),
        irrigation: acc.irrigation + (item.irrigation || 0),
        gnr: acc.gnr + (item.gnr || 0),
        prixVente: acc.prixVente + (item.prixVente || 0),
        margeBrute: acc.margeBrute + (item.margeBrute || 0),
      }),
      { cost: 0, workTime: 0, ges: 0, charges: 0, semences: 0, engrais: 0, unitesMineral: 0, azoteOrganique: 0, oligos: 0, phytos: 0, ift: 0, hri1: 0, mecanisation: 0, irrigation: 0, gnr: 0, prixVente: 0, margeBrute: 0 }
    );
  };

  // Calculate grand totals
  const grandTotals = interventions.reduce(
    (acc, item) => ({
      cost: acc.cost + (item.cost || 0),
      workTime: acc.workTime + (item.workTime || 0),
      ges: acc.ges + (item.ges || 0),
      charges: acc.charges + (item.charges || 0),
      semences: acc.semences + (item.semences || 0),
      engrais: acc.engrais + (item.engrais || 0),
      unitesMineral: acc.unitesMineral + (item.unitesMineral || 0),
      azoteOrganique: acc.azoteOrganique + (item.azoteOrganique || 0),
      oligos: acc.oligos + (item.oligos || 0),
      phytos: acc.phytos + (item.phytos || 0),
      ift: acc.ift + (item.ift || 0),
      hri1: acc.hri1 + (item.hri1 || 0),
      mecanisation: acc.mecanisation + (item.mecanisation || 0),
      irrigation: acc.irrigation + (item.irrigation || 0),
      gnr: acc.gnr + (item.gnr || 0),
      prixVente: acc.prixVente + (item.prixVente || 0),
      margeBrute: acc.margeBrute + (item.margeBrute || 0),
    }),
    { cost: 0, workTime: 0, ges: 0, charges: 0, semences: 0, engrais: 0, unitesMineral: 0, azoteOrganique: 0, oligos: 0, phytos: 0, ift: 0, hri1: 0, mecanisation: 0, irrigation: 0, gnr: 0, prixVente: 0, margeBrute: 0 }
  );

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
  const handleCellFocus = (interventionId: string, interventionName: string, columnName: string, initialValue: any) => {
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
              <div className="bg-white border border-gray-200 rounded-lg p-5">
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
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
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

      {!compareVersions && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-auto scrollbar-visible" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <table className="w-full text-sm relative">
            <thead className="sticky top-0 z-10">
              {/* First row: Thematic groups */}
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left w-12 bg-gray-50 sticky left-0 z-20"></th>
                <th className="px-4 py-2 text-left min-w-[150px] bg-gray-50 sticky left-12 z-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"></th>
                {visibleColumns.has('description') && <th className="px-4 py-2 text-left min-w-[200px] bg-gray-50"></th>}
                {visibleColumns.has('produit') && <th className="px-4 py-2 text-left min-w-[180px] bg-gray-50"></th>}
                {/* Agronomique group */}
                {(visibleColumns.has('date') || visibleColumns.has('frequence') || visibleColumns.has('unitesMineral') || visibleColumns.has('azoteOrganique') || visibleColumns.has('oligos')) && (
                  <th 
                    className="px-4 py-2 text-center bg-green-50 border-l border-gray-300" 
                    colSpan={
                      (visibleColumns.has('date') ? 1 : 0) +
                      (visibleColumns.has('frequence') ? 1 : 0) +
                      (visibleColumns.has('unitesMineral') ? 1 : 0) +
                      (visibleColumns.has('azoteOrganique') ? 1 : 0) +
                      (visibleColumns.has('oligos') ? 1 : 0)
                    }
                  >
                    Agronomique
                  </th>
                )}
                {/* Environnemental et social group */}
                {(visibleColumns.has('phytos') || visibleColumns.has('ift') || visibleColumns.has('hri1') || visibleColumns.has('ges') || visibleColumns.has('workTime')) && (
                  <th 
                    className="px-4 py-2 text-center bg-blue-50 border-l border-gray-300" 
                    colSpan={
                      (visibleColumns.has('phytos') ? 1 : 0) +
                      (visibleColumns.has('ift') ? 1 : 0) +
                      (visibleColumns.has('hri1') ? 1 : 0) +
                      (visibleColumns.has('ges') ? 1 : 0) +
                      (visibleColumns.has('workTime') ? 1 : 0)
                    }
                  >
                    Environnemental et social
                  </th>
                )}
                {/* Financier group */}
                {(visibleColumns.has('semences') || visibleColumns.has('engrais') || visibleColumns.has('mecanisation') || visibleColumns.has('gnr') || visibleColumns.has('irrigation') || visibleColumns.has('charges') || visibleColumns.has('prixVente') || visibleColumns.has('margeBrute')) && (
                  <th 
                    className="px-4 py-2 text-center bg-amber-50 border-l border-gray-300" 
                    colSpan={
                      (visibleColumns.has('semences') ? 1 : 0) +
                      (visibleColumns.has('engrais') ? 1 : 0) +
                      (visibleColumns.has('mecanisation') ? 1 : 0) +
                      (visibleColumns.has('gnr') ? 1 : 0) +
                      (visibleColumns.has('irrigation') ? 1 : 0) +
                      (visibleColumns.has('charges') ? 1 : 0) +
                      (visibleColumns.has('prixVente') ? 1 : 0) +
                      (visibleColumns.has('margeBrute') ? 1 : 0)
                    }
                  >
                    Financier
                  </th>
                )}
              </tr>
              {/* Second row: Individual columns */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left w-12 bg-gray-50 sticky left-0 z-20"></th>
                <th className="px-4 py-3 text-left min-w-[150px] bg-gray-50 sticky left-12 z-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">Intervention</th>
                {visibleColumns.has('description') && <th className="px-4 py-3 text-left min-w-[200px] bg-gray-50">Description</th>}
                {visibleColumns.has('produit') && <th className="px-4 py-3 text-left min-w-[180px] bg-gray-50">Produit</th>}
                {/* Agronomique columns */}
                {visibleColumns.has('date') && <th className="px-4 py-3 text-left bg-green-50 border-l border-gray-300">Date</th>}
                {visibleColumns.has('frequence') && <th className="px-4 py-3 text-right bg-green-50">Fréquence</th>}
                {visibleColumns.has('unitesMineral') && <th className="px-4 py-3 text-right bg-green-50">Unités minéral (azote)</th>}
                {visibleColumns.has('azoteOrganique') && <th className="px-4 py-3 text-right bg-green-50">Azote organique</th>}
                {visibleColumns.has('oligos') && <th className="px-4 py-3 text-right bg-green-50">Rendement (TMS)</th>}
                {/* Environnemental et social columns */}
                {visibleColumns.has('phytos') && <th className="px-4 py-3 text-right bg-blue-50 border-l border-gray-300">Phytos</th>}
                {visibleColumns.has('ift') && <th className="px-4 py-3 text-right bg-blue-50">IFT</th>}
                {visibleColumns.has('hri1') && <th className="px-4 py-3 text-right bg-blue-50">EIQ</th>}
                {visibleColumns.has('ges') && <th className="px-4 py-3 text-right bg-blue-50">GES</th>}
                {visibleColumns.has('workTime') && <th className="px-4 py-3 text-right bg-blue-50">Temps de travail</th>}
                {/* Financier columns */}
                {visibleColumns.has('semences') && <th className="px-4 py-3 text-right bg-amber-50 border-l border-gray-300">Semences</th>}
                {visibleColumns.has('engrais') && <th className="px-4 py-3 text-right bg-amber-50">Engrais</th>}
                {visibleColumns.has('mecanisation') && (
                  <th 
                    className="px-4 py-3 text-right bg-amber-50 relative"
                    onMouseEnter={() => setShowMecanisationTooltip(true)}
                    onMouseLeave={() => setShowMecanisationTooltip(false)}
                  >
                    Mécanisation
                    {showMecanisationTooltip && (
                      <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-64 p-4 text-left">
                        <p className="text-sm text-gray-700 mb-2">GNR inclus</p>
                        <a href="#" className="text-sm text-[#6b9571] hover:underline" onClick={(e) => e.preventDefault()}>
                          Paramètres de calcul de cette colonne
                        </a>
                      </div>
                    )}
                  </th>
                )}
                {visibleColumns.has('gnr') && <th className="px-4 py-3 text-right bg-amber-50">GNR</th>}
                {visibleColumns.has('irrigation') && <th className="px-4 py-3 text-right bg-amber-50">Irrigation</th>}
                {visibleColumns.has('charges') && <th className="px-4 py-3 text-right bg-amber-50">Total charges</th>}
                {visibleColumns.has('prixVente') && <th className="px-4 py-3 text-right bg-amber-50">Prix de vente</th>}
                {visibleColumns.has('margeBrute') && <th className="px-4 py-3 text-right bg-amber-50">Marge brute</th>}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedInterventions).flatMap(([category, categoryInterventions]) => {
                const isExpanded = expandedCategories.has(category);
                const totals = calculateCategoryTotals(categoryInterventions);

                const rows = [
                  // Category row
                  <tr key={`${category}-header`} className="bg-[#f9fafb] border-t border-gray-200 hover:bg-gray-200 cursor-pointer" onClick={() => toggleCategory(category)}>
                      <td className="px-4 py-3 align-top sticky left-0 z-10 bg-[#f9fafb] hover:bg-gray-200">
                        {isExpanded ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </td>
                      <td 
                        className="px-4 py-3 sticky left-12 z-10 bg-[#f9fafb] hover:bg-gray-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]" 
                        colSpan={
                          1 + 
                          (visibleColumns.has('description') ? 1 : 0) + 
                          (visibleColumns.has('produit') ? 1 : 0)
                        }
                      >
                        <div>
                          <div>{category}</div>
                          {categoryDescriptions[category] && (
                            <div className="text-sm text-gray-500 mt-0.5 leading-snug line-clamp-2 cursor-help" title={categoryDescriptions[category]}>
                              {categoryDescriptions[category]}
                            </div>
                          )}
                        </div>
                      </td>
                      {visibleColumns.has('date') && <td className="px-4 py-3"></td>}
                      {visibleColumns.has('frequence') && <td className="px-4 py-3"></td>}
                      {visibleColumns.has('unitesMineral') && <td className="px-4 py-3 text-right">{totals.unitesMineral > 0 ? totals.unitesMineral.toFixed(0) : ''}</td>}
                      {visibleColumns.has('azoteOrganique') && <td className="px-4 py-3 text-right">{totals.azoteOrganique > 0 ? totals.azoteOrganique.toFixed(0) : ''}</td>}
                      {visibleColumns.has('oligos') && <td className="px-4 py-3 text-right">{totals.oligos > 0 ? totals.oligos.toFixed(0) : ''}</td>}
                      {visibleColumns.has('phytos') && <td className="px-4 py-3 text-right">{totals.phytos > 0 ? totals.phytos.toFixed(0) : ''}</td>}
                      {visibleColumns.has('ift') && <td className="px-4 py-3 text-right">{totals.ift > 0 ? totals.ift.toFixed(1) : ''}</td>}
                      {visibleColumns.has('hri1') && <td className="px-4 py-3 text-right">{totals.hri1 > 0 ? totals.hri1.toFixed(1) : ''}</td>}
                      {visibleColumns.has('ges') && <td className="px-4 py-3 text-right">{totals.ges.toFixed(1)}</td>}
                      {visibleColumns.has('workTime') && <td className="px-4 py-3 text-right">{totals.workTime.toFixed(1)}</td>}
                      {visibleColumns.has('semences') && <td className="px-4 py-3 text-right">{totals.semences > 0 ? totals.semences.toFixed(0) : ''}</td>}
                      {visibleColumns.has('engrais') && <td className="px-4 py-3 text-right">{totals.engrais > 0 ? totals.engrais.toFixed(0) : ''}</td>}
                      {visibleColumns.has('mecanisation') && <td className="px-4 py-3 text-right">{totals.mecanisation > 0 ? totals.mecanisation.toFixed(0) : ''}</td>}
                      {visibleColumns.has('gnr') && <td className="px-4 py-3 text-right">{totals.gnr > 0 ? totals.gnr.toFixed(0) : ''}</td>}
                      {visibleColumns.has('irrigation') && <td className="px-4 py-3 text-right">{totals.irrigation > 0 ? totals.irrigation.toFixed(0) : ''}</td>}
                      {visibleColumns.has('charges') && <td className="px-4 py-3 text-right">{totals.charges.toFixed(0)}</td>}
                      {visibleColumns.has('prixVente') && <td className="px-4 py-3 text-right">{totals.prixVente > 0 ? `${totals.prixVente.toFixed(0)} €` : ''}</td>}
                      {visibleColumns.has('margeBrute') && <td className="px-4 py-3 text-right">{totals.margeBrute > 0 ? totals.margeBrute.toFixed(0) : ''}</td>}
                    </tr>
                ];

                // Add intervention rows if expanded
                if (isExpanded) {
                  categoryInterventions.forEach((intervention) => {
                    rows.push(
                        <tr
                          key={intervention.id}
                          className="h-[48px]"
                        >
                          <td className="px-4 py-0 border border-[#ebebeb] sticky left-0 z-10 bg-white"></td>
                          <td className="px-4 py-0 pl-8 border border-[#ebebeb] h-[48px] align-middle text-[#212121] sticky left-12 z-10 bg-white shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">{intervention.name}</td>
                          {visibleColumns.has('description') && (
                            <td className="px-0 py-0 border border-[#ebebeb] h-[48px]">
                              <input
                                type="text"
                                value={intervention.description || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'description', e.target.value)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'description')} border-none text-[14px] text-[#212121] leading-[24px] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                placeholder="Description..."
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'description')}
                                onBlur={(e) => handleCellBlur(e)}
                              />
                            </td>
                          )}
                          {visibleColumns.has('produit') && (
                            <td className="px-0 py-0 border border-[#ebebeb] h-[48px]">
              <input
                                type="text"
                                value={intervention.produit || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'produit', e.target.value)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'produit')} border-none text-[14px] text-[#212121] leading-[24px] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                placeholder="Produit..."
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'produit')}
                                onBlur={(e) => handleCellBlur(e)}
                              />
                            </td>
                          )}
                          {visibleColumns.has('date') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="date"
                                value={intervention.date.toISOString().split('T')[0]}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'date', new Date(e.target.value))
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'date')} border-none text-[14px] text-[#212121] leading-[24px] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'date')}
                                onBlur={(e) => handleCellBlur(e)}
                              />
                            </td>
                          )}
                          {visibleColumns.has('frequence') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                value={intervention.frequence || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'frequence', parseFloat(e.target.value) || 0)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'frequence')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'frequence')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('unitesMineral') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                value={intervention.unitesMineral || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'unitesMineral', parseFloat(e.target.value) || 0)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'unitesMineral')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'unitesMineral')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('azoteOrganique') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                value={intervention.azoteOrganique || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'azoteOrganique', parseFloat(e.target.value) || 0)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'azoteOrganique')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'azoteOrganique')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('oligos') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                value={intervention.oligos || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'oligos', parseFloat(e.target.value) || 0)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'oligos')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'oligos')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('phytos') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                value={intervention.phytos || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'phytos', parseFloat(e.target.value) || 0)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'phytos')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'phytos')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('ift') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                step="0.1"
                                value={intervention.ift || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'ift', parseFloat(e.target.value) || 0)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'ift')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'ift')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('hri1') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                step="0.1"
                                value={intervention.hri1 || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'hri1', parseFloat(e.target.value) || 0)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'hri1')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'hri1')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('ges') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                step="0.1"
                                value={intervention.ges}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'ges', parseFloat(e.target.value))
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'ges')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'ges')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('workTime') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                step="0.1"
                                value={intervention.workTime}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'workTime', parseFloat(e.target.value))
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'workTime')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'workTime')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('semences') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                value={intervention.semences || ''}
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value) || 0;
                                  updateIntervention(intervention.id, 'semences', newValue);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault(); // Empêche le comportement par défaut
                                    const newValue = parseFloat((e.target as HTMLInputElement).value) || 0;
                                    const oldValue = focusedCell?.initialValue ?? intervention.semences;
                                    if (onCellChange && oldValue !== newValue) {
                                      onCellChange(intervention.name, 'semences', oldValue, newValue);
                                    }
                                    // Ne pas appeler handleCellBlur() pour garder le focus
                                  }
                                }}
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'semences')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'semences', intervention.semences)}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('engrais') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                value={intervention.engrais || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'engrais', parseFloat(e.target.value) || 0)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'engrais')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'engrais')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('mecanisation') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                value={intervention.mecanisation || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'mecanisation', parseFloat(e.target.value) || 0)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'mecanisation', 'bg-[#ebf7ff]')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'mecanisation')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('gnr') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                value={intervention.gnr || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'gnr', parseFloat(e.target.value) || 0)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'gnr')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'gnr')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('irrigation') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                value={intervention.irrigation || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'irrigation', parseFloat(e.target.value) || 0)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'irrigation')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'irrigation')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('charges') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                value={intervention.charges}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'charges', parseFloat(e.target.value))
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'charges')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'charges')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('prixVente') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                value={intervention.prixVente || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'prixVente', parseFloat(e.target.value) || 0)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'prixVente')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'prixVente')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                          {visibleColumns.has('margeBrute') && (
                            <td className="px-0 py-0 border border-[#ebebeb] bg-[#ebf7ff] h-[48px]">
                              <input
                                type="number"
                                value={intervention.margeBrute || ''}
                                onChange={(e) =>
                                  updateIntervention(intervention.id, 'margeBrute', parseFloat(e.target.value) || 0)
                                }
                                className={`w-full h-[48px] px-4 ${getInputBgClass(intervention.id, 'margeBrute')} border-none text-[14px] text-[#212121] leading-[24px] text-right focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a6ad4]`}
                                onFocus={() => handleCellFocus(intervention.id, intervention.name, 'margeBrute')}
                                onBlur={() => handleCellBlur()}
                              />
                            </td>
                          )}
                        </tr>
                    );
                  });
                }

                return rows;
              })}

              {/* Grand total row */}
              <tr className="bg-gray-100 border-t-2 border-gray-300 sticky bottom-0">
                <td className="px-4 py-3 bg-gray-100"></td>
                <td className="px-4 py-3 bg-gray-100">Total général</td>
                {visibleColumns.has('description') && <td className="px-4 py-3 bg-gray-100"></td>}
                {visibleColumns.has('produit') && <td className="px-4 py-3 bg-gray-100"></td>}
                {visibleColumns.has('date') && <td className="px-4 py-3 bg-gray-100"></td>}
                {visibleColumns.has('frequence') && <td className="px-4 py-3 bg-gray-100"></td>}
                {visibleColumns.has('unitesMineral') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.unitesMineral > 0 ? grandTotals.unitesMineral.toFixed(0) : ''}</td>}
                {visibleColumns.has('azoteOrganique') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.azoteOrganique > 0 ? grandTotals.azoteOrganique.toFixed(0) : ''}</td>}
                {visibleColumns.has('oligos') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.oligos > 0 ? grandTotals.oligos.toFixed(0) : ''}</td>}
                {visibleColumns.has('phytos') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.phytos > 0 ? grandTotals.phytos.toFixed(0) : ''}</td>}
                {visibleColumns.has('ift') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.ift > 0 ? grandTotals.ift.toFixed(1) : ''}</td>}
                {visibleColumns.has('hri1') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.hri1 > 0 ? grandTotals.hri1.toFixed(1) : ''}</td>}
                {visibleColumns.has('ges') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.ges.toFixed(1)} kg</td>}
                {visibleColumns.has('workTime') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.workTime.toFixed(1)} h</td>}
                {visibleColumns.has('semences') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.semences > 0 ? `${grandTotals.semences.toFixed(0)} €` : ''}</td>}
                {visibleColumns.has('engrais') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.engrais > 0 ? `${grandTotals.engrais.toFixed(0)} €` : ''}</td>}
                {visibleColumns.has('mecanisation') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.mecanisation > 0 ? `${grandTotals.mecanisation.toFixed(0)} €` : ''}</td>}
                {visibleColumns.has('gnr') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.gnr > 0 ? grandTotals.gnr.toFixed(0) : ''}</td>}
                {visibleColumns.has('irrigation') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.irrigation > 0 ? `${grandTotals.irrigation.toFixed(0)} €` : ''}</td>}
                {visibleColumns.has('charges') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.charges.toFixed(0)} €</td>}
                {visibleColumns.has('prixVente') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.prixVente > 0 ? `${grandTotals.prixVente.toFixed(0)} €` : ''}</td>}
                {visibleColumns.has('margeBrute') && <td className="px-4 py-3 text-right bg-gray-100">{grandTotals.margeBrute > 0 ? `${grandTotals.margeBrute.toFixed(0)} €` : ''}</td>}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal AI Detail */}
      {showAiDetailModal && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50" onClick={() => setShowAiDetailModal(null)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg mb-4">Détail du calcul IA</h3>
            <div className="bg-gray-50 rounded p-4 mb-4">
              <p className="text-sm text-gray-700 mb-2"><strong>Intervention :</strong> {interventions.find(i => i.id === showAiDetailModal)?.name}</p>
              <p className="text-sm text-gray-700 mb-2"><strong>Coût de mécanisation calculé :</strong> {interventions.find(i => i.id === showAiDetailModal)?.mecanisation} €</p>
              <p className="text-sm text-gray-600 mt-3">Le coût de mécanisation a été calculé automatiquement par notre IA en fonction du type d&apos;intervention, de la surface, et des paramètres régionaux. Ce calcul inclut le GNR, l&apos;amortissement du matériel et la main d&apos;œuvre.</p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                onClick={() => setShowAiDetailModal(null)}
              >
                Fermer
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-colors"
                onClick={() => {
                  alert('Relance du calcul en cours...');
                  setShowAiDetailModal(null);
                }}
              >
                <RefreshCw className="size-4" />
                Relancer le calcul
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}