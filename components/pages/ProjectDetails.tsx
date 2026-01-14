import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FolderOpen, Download, Trash2, Settings, ChevronsRight, ChevronDown, Send, Sparkles } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { ContextPanel } from '@/components/ContextPanel';
import { InterventionsTable } from '@/components/InterventionsTable';
import { ChatBot } from '@/components/ChatBot';
import { AIAssistant } from '@/components/ai-assistant';
import { InterventionData, RotationData } from '@/lib/types';
import { variant1Interventions } from '@/lib/data/variant1Interventions';
import { ItineraireTechnique } from '@/components/ItineraireTechnique';
import { InterventionsDataTable } from '@/components/interventions-table';

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
  variant?: string;
}

export function ProjectDetails({ projectId, onBack, variant = 'Originale' }: ProjectDetailsProps) {
  // Project configuration
  const projectSurface = 15; // hectares
  const rotationStartYear = 2027;
  const rotationEndYear = 2033;

  const [systemData, setSystemData] = useState<any>(null);
  const [systemName, setSystemName] = useState<string>('');
  const [farmerName, setFarmerName] = useState<string>('');
  const [farmName, setFarmName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [gpsLocation, setGpsLocation] = useState<string | null>(null);

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
      // Si on reçoit les données mises à jour directement
      setSystemData(updatedData);
      return;
    }
    
    // Sinon, recharger depuis l'API
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
        setSystemName(system.name || 'Rotation Bio 2027-2033');
        setFarmerName(system.farmer_name || 'Jean Dupont');
        setFarmName(system.farm_name || 'EARL Dupont');
        setGpsLocation(system.gps_location || null);
      })
      .catch(error => {
        console.error('Erreur lors du chargement du système:', error);
        // Valeurs par défaut en cas d'erreur
        setSystemName('Rotation Bio 2027-2033');
        setFarmerName('Jean Dupont');
        setFarmName('EARL Dupont');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const [rotationData] = useState<RotationData[]>([
    {
      id: 'r1',
      name: 'Orge + Lupin',
      startDate: new Date('2027-09-15'),
      endDate: new Date('2028-07-10'),
      color: '#F59E0B',
      layer: 0
    },
    {
      id: 'r2',
      name: 'Luzerne + trèfle violet et blanc',
      startDate: new Date('2028-08-01'),
      endDate: new Date('2029-05-20'),
      color: '#8B5CF6',
      layer: 0
    },
    {
      id: 'r3',
      name: 'CIVE (Triticale)',
      startDate: new Date('2029-02-15'),
      endDate: new Date('2029-05-20'),
      color: '#10B981',
      layer: 0
    },
    {
      id: 'r4',
      name: 'Quinoa',
      startDate: new Date('2029-06-15'),
      endDate: new Date('2029-09-10'),
      color: '#06B6D4',
      layer: 0
    },
    {
      id: 'r5',
      name: 'Blé + féverole',
      startDate: new Date('2029-11-01'),
      endDate: new Date('2030-07-25'),
      color: '#F59E0B',
      layer: 0
    },
    {
      id: 'r6',
      name: 'Colza + sarrasin',
      startDate: new Date('2030-08-05'),
      endDate: new Date('2031-07-15'),
      color: '#FBBF24',
      layer: 0
    },
    {
      id: 'r7',
      name: 'Maïs grain',
      startDate: new Date('2031-10-20'),
      endDate: new Date('2032-10-15'),
      color: '#EAB308',
      layer: 0
    },
    {
      id: 'r8',
      name: 'Phacélie (couvert)',
      startDate: new Date('2032-11-01'),
      endDate: new Date('2033-03-15'),
      color: '#84CC16',
      layer: 0
    },
    {
      id: 'r9',
      name: 'Méteil grain',
      startDate: new Date('2033-03-25'),
      endDate: new Date('2033-07-15'),
      color: '#22C55E',
      layer: 0
    }
  ]);

  const [currentVariant, setCurrentVariant] = useState(variant);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [chatOpen, setChatOpen] = useState(true);
  const [focusedCell, setFocusedCell] = useState<{ interventionName: string; columnName: string } | null>(null);
  const [contextualMessages, setContextualMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);

  // AI Assistant state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [aiAssistantFocusedCell, setAIAssistantFocusedCell] = useState<{
    stepIndex: number;
    interventionIndex: number;
    indicatorKey: string;
  } | undefined>(undefined);

  const variants = ['Originale', 'Variante 1'];

  const getColumnLabel = (columnName: string): string => {
    const labels: Record<string, string> = {
      semences: 'semences',
      engrais: 'engrais',
      azoteMineral: 'unités minéral',
      azoteOrganique: 'azote organique',
      oligos: 'rendement',
      phytos: 'phytos',
      ift: 'IFT',
      hri1: 'HRI1',
      mecanisation: 'mécanisation',
      irrigation: 'irrigation',
      workTime: 'temps de travail',
      gnr: 'GNR',
      ges: 'GES',
      charges: 'charges',
      prixVente: 'prix de vente',
      margeBrute: 'marge brute'
    };
    return labels[columnName] || columnName;
  };

  const handleCellChange = (interventionName: string, columnName: string, oldValue: any, newValue: any) => {
    if (chatOpen) {
      const columnLabel = getColumnLabel(columnName);
      const newMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: 'Je vois que vous avez modifié le montant des ' + columnLabel + ' pour "' + interventionName + '", pouvez-vous m' + String.fromCharCode(39) + 'expliquer pourquoi ?',
        timestamp: new Date()
      };
      setContextualMessages(prev => [...prev, newMessage]);
    }
  };

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
      />

      {/* Contenu principal et ChatBot côte à côte en dessous de la TopBar */}
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
                  <br />15 ha • Bio • Toulouse (31) • Sol argileux
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-colors text-sm">
                <ChevronsRight className="size-4" />
                Modifier l&apos;itinéraire technique
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-colors text-sm">
                <FolderOpen className="size-4" />
                Charger une rotation
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-colors text-sm">
                <Download className="size-4" />
                Exporter (.xsls)
              </button>
              <button className="group flex items-center gap-0 hover:gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-all duration-300 text-sm">
                <Settings className="size-4" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
                  Réglages
                </span>
              </button>
              <button className="group flex items-center gap-0 hover:gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-red-600 transition-all duration-300 text-sm">
                <Trash2 className="size-4" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
                  Tout effacer
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
              data={systemData}
              className="w-full"
            />
          </section>          {/* Context Panel Section */}
          <ContextPanel gpsLocation={gpsLocation} />

          {/* Interventions Table Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Table des interventions basée sur systemData */}
            <InterventionsDataTable 
              systemData={systemData} 
              systemId={projectId}
              onUpdate={fetchSystemData}
              onCellFocus={(stepIndex, interventionIndex, indicatorKey) => {
                setAIAssistantFocusedCell({ stepIndex, interventionIndex, indicatorKey });
                setIsAIAssistantOpen(true);
              }}
            />            
          </section>

        </main>

        {/* ChatBot side panel */}
        {/* <ChatBot
          isOpen={chatOpen}
          setIsOpen={setChatOpen}
          focusedCell={focusedCell}
          contextualMessages={contextualMessages}
          onAddContextualMessage={(message) => {
            setContextualMessages(prev => [...prev, message]);
          }}
        /> */}

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
        />
      </div>
    </div>
  );
}