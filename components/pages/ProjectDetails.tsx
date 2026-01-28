import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FolderOpen, Download, Trash2, Settings, ChevronsRight, ChevronDown, Send, Sparkles } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { ContextPanel } from '@/components/ContextPanel';
import { InterventionsTable } from '@/components/InterventionsTable';
import { AIAssistant } from '@/components/ai-assistant';
import CalculationAlert from '@/components/ai-assistant/CalculationAlert';
import { ItineraireTechnique, ItineraireTechniqueRef } from '@/components/ItineraireTechnique';
import { useDebouncedSave, SaveStatus } from '@/lib/hooks/useDebouncedSave';
import { calculateSystemTotals } from '@/lib/calculate-system-totals';
import { useAuth } from '@/lib/auth';

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
  variant?: string;
}

export function ProjectDetails({ projectId, onBack, variant = 'Originale' }: ProjectDetailsProps) {
  // Auth
  const { user } = useAuth();

  // Project configuration
  const projectSurface = 15; // hectares
  const rotationStartYear = 2027;
  const rotationEndYear = 2033;

  const [systemData, setSystemData] = useState<any>(null);
  const [systemName, setSystemName] = useState<string>('');
  const [farmerName, setFarmerName] = useState<string>('');
  const [farmName, setFarmName] = useState<string>('');
  const [town, setTown] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [gpsLocation, setGpsLocation] = useState<string | null>(null);
  const [isBatchCalculating, setIsBatchCalculating] = useState<boolean>(false);
  const [isBatchPrepared, setIsBatchPrepared] = useState<boolean>(false);
  const [recalculateAll, setRecalculateAll] = useState<boolean>(false);
  const [batchEstimation, setBatchEstimation] = useState<{ 
    indicatorsWithoutValue: number; 
    totalCalculableIndicators: number; 
    estimatedSeconds: number;
    estimatedSecondsAll: number;
  } | null>(null);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentIndicator: '', stepName: '', interventionName: '' });
  const [batchAbortController, setBatchAbortController] = useState<AbortController | null>(null);
  const [batchProcessLogId, setBatchProcessLogId] = useState<number | null>(null);
  const batchProcessLogIdRef = useRef<number | null>(null);
  const [calculationAlert, setCalculationAlert] = useState<{ type: 'success' | 'error' | 'info'; title: string; message: string } | null>(null);

  // Setup debounced save with 10 second delay
  const { saveStatus, triggerSave, forceSave } = useDebouncedSave({
    systemId: projectId,
    onSave: async (data: any) => {
      console.log('Storing system data (async)');

      const response = await fetch(`/api/systems/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: data }),
      });
      if (!response.ok) {
        throw new Error('Failed to save system data');
      }
    },
    debounceMs: 5000, // 5 seconds
  });

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Charger les données du système depuis l'API
  useEffect(() => {
    if (!isMounted) return;

    fetchSystemData();
  }, [projectId, isMounted]);

  const fetchSystemData = (updatedData?: any) => {
    if (updatedData) {
      // Calculate totals client-side
      const calculatedData = calculateSystemTotals(updatedData);

      // Update UI immediately with calculated data
      setSystemData(calculatedData);

      // Trigger debounced save to server
      triggerSave(calculatedData);
      return;
    }

    // Initial load from API
    setIsLoading(true);
    fetch(`/api/systems/${projectId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('System not found');
        }
        return res.json();
      })
      .then(system => {
        if (system.json) {
          setSystemData(system.json);
        }
        setSystemName(system.name || 'Libellé du système');
        setFarmerName(system.farmer_name || "Nom de l'agriculteur");
        setFarmName(system.farm_name || 'Nom de la ferme');
        setTown(system.town || '');
        setGpsLocation(system.gps_location || null);
      })
      .catch(error => {
        console.error('Erreur lors du chargement du système:', error);
        // Valeurs par défaut en cas d'erreur
        setSystemName('Libellé du système');
        setFarmerName("Nom de l'agriculteur");
        setFarmName('Nom de la ferme');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const [currentVariant, setCurrentVariant] = useState(variant);

  // AI Assistant state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [aiAssistantFocusedCell, setAIAssistantFocusedCell] = useState<{
    stepIndex: number;
    interventionIndex: number;
    indicatorKey: string;
  } | undefined>(undefined);

  // Ref pour le graphique ItineraireTechnique
  const itineraireTechniqueRef = useRef<ItineraireTechniqueRef>(null);

  // Redimensionner le graphique quand l'assistant IA change d'état
  useEffect(() => {
    // Timeout pour laisser le temps au DOM de se mettre à jour
    const timeoutId = setTimeout(() => {
      if (itineraireTechniqueRef.current) {
        itineraireTechniqueRef.current.resize();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isAIAssistantOpen]);

  const handleCalculateIndicator = async () => {
    if (!aiAssistantFocusedCell) return;

    const { stepIndex, interventionIndex, indicatorKey } = aiAssistantFocusedCell;

    try {
      const response = await fetch('/api/ai/calculate-indicator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemId: projectId,
          stepIndex,
          interventionIndex,
          indicatorKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to calculate indicator');
      }

      const result = await response.json();

      // Refresh system data to show the new calculation
      if (result.updatedSystemData) {
        await fetchSystemData();
      }

    } catch (error: any) {
      console.error('Error calculating indicator:', error);
      alert(`Erreur lors du calcul: ${error.message}`);
      throw error; // Re-throw to let the button handle loading state
    }
  };

  // Prepare calculation: detect indicators and create log
  const handleCalculateAllMissing = async () => {
    console.log('[handleCalculateAllMissing] Preparing batch calculation...');

    setIsAIAssistantOpen(true);
    setIsBatchPrepared(false);
    setBatchEstimation(null);
    setBatchProcessLogId(null);
    batchProcessLogIdRef.current = null;

    try {
      const response = await fetch('/api/ai/prepare-calculation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemId: projectId,
          userId: user?.userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to prepare calculation');
      }

      const data = await response.json();
      console.log('[handleCalculateAllMissing] Preparation complete:', data);

      setBatchProcessLogId(data.processLogId);
      batchProcessLogIdRef.current = data.processLogId;
      setBatchEstimation({
        indicatorsWithoutValue: data.indicatorsWithoutValue,
        totalCalculableIndicators: data.totalCalculableIndicators,
        estimatedSeconds: data.estimatedSeconds,
        estimatedSecondsAll: data.estimatedSecondsAll
      });
      setRecalculateAll(false); // Default: only without value
      setIsBatchPrepared(true);

    } catch (error: any) {
      console.error('[handleCalculateAllMissing] Error:', error);
      setCalculationAlert({
        type: 'error',
        title: 'Erreur',
        message: `Erreur lors de la préparation: ${error.message}`,
      });
      setIsAIAssistantOpen(false);
    }
  };

  // Start actual calculation with SSE
  const handleStartCalculation = async () => {
    console.log('[handleStartCalculation] Starting batch calculation with SSE...');

    setIsBatchCalculating(true);
    setIsBatchPrepared(false);
    setBatchProgress({ current: 0, total: 0, currentIndicator: '', stepName: '', interventionName: '' });

    try {
      // Use POST request to initiate SSE stream with processLogId
      const response = await fetch('/api/ai/calculate-all-missing-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemId: projectId,
          processLogId: batchProcessLogIdRef.current,
          userId: user?.userId,
          recalculateAll,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start calculation stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Create abort controller for cancellation
      const abortController = new AbortController();
      setBatchAbortController(abortController);

      // Listen for abort
      abortController.signal.addEventListener('abort', async () => {
        reader.cancel();
        console.log('[handleCalculateAllMissing] Stream cancelled by user');

        // Call abort API if we have a processLogId (use ref to get current value)
        const processLogId = batchProcessLogIdRef.current;
        if (processLogId) {
          try {
            console.log('[handleCalculateAllMissing] Calling abort API for processLogId:', processLogId);
            await fetch('/api/ai/abort-calculation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ processLogId }),
            });
            console.log('[handleCalculateAllMissing] Abort API called successfully');
          } catch (error) {
            console.error('[handleCalculateAllMissing] Error calling abort API:', error);
          }
        } else {
          console.warn('[handleCalculateAllMissing] No processLogId available yet for abort');
        }
      });

      // Read stream
      while (true) {
        const { done, value } = await reader.read();

        if (done || abortController.signal.aborted) {
          break;
        }

        // Append to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete messages (SSE format: "data: {...}\n\n")
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete message in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));

              if (data.type === 'started') {
                console.log('[handleCalculateAllMissing] Process started with ID:', data.processLogId);
                setBatchProcessLogId(data.processLogId);
                batchProcessLogIdRef.current = data.processLogId;
              } else if (data.type === 'progress') {
                console.log(`[handleCalculateAllMissing] Progress: ${data.current}/${data.total} - ${data.stepName} / ${data.interventionName} / ${data.currentIndicator}`);
                setBatchProgress({
                  current: data.current,
                  total: data.total,
                  currentIndicator: data.currentIndicator,
                  stepName: data.stepName,
                  interventionName: data.interventionName
                });
              } else if (data.type === 'complete') {
                console.log('[handleCalculateAllMissing] Calculation complete:', data);

                // Update final progress
                setBatchProgress({
                  current: data.calculatedCount,
                  total: data.total,
                  currentIndicator: '',
                  stepName: '',
                  interventionName: ''
                });

                // Reload system data
                fetchSystemData();

                // Show completion alert
                if (!abortController.signal.aborted) {
                  setCalculationAlert({
                    type: 'success',
                    title: 'Calcul terminé !',
                    message: `${data.calculatedCount} indicateurs calculés sur ${data.total}.`,
                  });
                }
              } else if (data.type === 'error') {
                console.error('[handleCalculateAllMissing] Error from server:', data.message);
                setCalculationAlert({
                  type: 'error',
                  title: 'Erreur',
                  message: `Erreur lors du calcul : ${data.message}`,
                });
              }
            } catch (error) {
              console.error('[handleCalculateAllMissing] Error parsing SSE data:', error);
            }
          }
        }
      }

    } catch (error: any) {
      console.error('[handleCalculateAllMissing] Error:', error);
      if (error.name === 'AbortError') {
        console.log('Batch calculation cancelled by user');
        setCalculationAlert({
          type: 'info',
          title: 'Calcul interrompu',
          message: 'Le calcul en lot a été interrompu.',
        });
      } else {
        setCalculationAlert({
          type: 'error',
          title: 'Erreur',
          message: `Erreur lors du calcul en lot: ${error.message}`,
        });
      }
    } finally {
      setIsBatchCalculating(false);
      setBatchAbortController(null);
      setBatchEstimation(null);
      batchProcessLogIdRef.current = null;
    }
  };

  const handleCancelBatchCalculation = () => {
    if (batchAbortController) {
      batchAbortController.abort();
      setCalculationAlert({
        type: 'info',
        title: 'Calcul interrompu',
        message: 'Le calcul en lot a été interrompu.',
      });
    } else if (isBatchPrepared) {
      // If cancelling from the preparation phase
      setIsBatchPrepared(false);
      setBatchEstimation(null);
      setRecalculateAll(false);
      batchProcessLogIdRef.current = null;
    }
  };

  // Ne pas rendre le composant tant qu'il n'est pas monté côté client
  if (!isMounted) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f5f5f0]">
      {/* TopBar en haut de tout */}
      <TopBar
        variant="project"
        onNavigateToList={onBack}
        currentVariant={currentVariant}
        onVariantChange={setCurrentVariant}
        rotationTitle={isLoading ? 'Chargement...' : systemName}
        saveStatus={saveStatus}
      />

      {/* Contenu principal et assistant côte à côte en dessous de la TopBar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Project title */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="mb-2">
                  {isLoading ? 'Chargement...' : `${systemName}-${currentVariant}`}
                </h1>
                <p className="text-gray-600">
                  {isLoading ? 'Chargement des informations...' : `${farmerName} • ${farmName}`}
                  <br />15 ha • Bio • {town} • Sol argileux
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.open(`/editor.html?itinera=${projectId}`, '_blank')}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-colors text-sm"
              >
                <ChevronsRight className="size-4" />
                Modifier le système
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-colors text-sm">
                <Download className="size-4" />
                Exporter (.xsls)
              </button>
              <button className="group flex items-center gap-0 hover:gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-all duration-300 text-sm">
                <Settings className="size-4" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap group-hover:ml-1">
                  Réglages
                </span>
              </button>
              {!isAIAssistantOpen && (
                <button
                  onClick={() => setIsAIAssistantOpen(true)}
                  className="flex items-center gap-2 px-[12px] py-[8px] bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-colors text-sm"
                  title="Ouvrir l'assistant IA"
                >
                  <Sparkles className="size-4" />
                  <ChevronDown className="size-4 rotate-90" />
                </button>
              )}
            </div>
          </div>

          {/* Rotation Timeline - Itinéraire Technique */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
            <ItineraireTechnique
              ref={itineraireTechniqueRef}
              data={systemData}
              className="w-full"
            />
          </section>          {/* Context Panel Section */}
          <ContextPanel gpsLocation={gpsLocation} />

          {/* Interventions Table Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <InterventionsTable
              surface={projectSurface}
              startYear={rotationStartYear}
              endYear={rotationEndYear}
              systemData={systemData}
              systemId={projectId}
              onUpdate={fetchSystemData}
              onCellFocusAI={(stepIndex, interventionIndex, indicatorKey) => {
                setAIAssistantFocusedCell({ stepIndex, interventionIndex, indicatorKey });
                setIsAIAssistantOpen(true);
              }}
              onCalculateAllMissing={handleCalculateAllMissing}
              isBatchCalculating={isBatchCalculating}
            />
          </section>

        </main>

        {/* AI Assistant panel */}
        <AIAssistant
          isOpen={isAIAssistantOpen}
          focusedCell={aiAssistantFocusedCell}
          systemData={systemData}
          systemId={projectId}
          onClose={() => {
            setIsAIAssistantOpen(false);
            setAIAssistantFocusedCell(undefined);
          }}
          onValueUpdate={fetchSystemData}
          onCalculate={handleCalculateIndicator}
          batchProgress={batchProgress}
          isBatchCalculating={isBatchCalculating}
          onCancelBatch={handleCancelBatchCalculation}
          isBatchPrepared={isBatchPrepared}
          batchEstimation={batchEstimation}
          onStartCalculation={handleStartCalculation}
          recalculateAll={recalculateAll}
          onRecalculateAllChange={setRecalculateAll}
        />
      </div>

      {/* Calculation Alert */}
      {calculationAlert && (
        <CalculationAlert
          type={calculationAlert.type}
          title={calculationAlert.title}
          message={calculationAlert.message}
          onClose={() => setCalculationAlert(null)}
        />
      )}
    </div>
  );
}