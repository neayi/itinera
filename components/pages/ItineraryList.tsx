import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Trash2, Copy, Plus, Upload, FileJson, Wheat } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { ItineraryCard } from '@/components/ItineraryCard';
import CheckBox from '@/components/imports/CheckBox';

interface Itinerary {
  id: string;
  name: string;
  farmer: string;
  exploitation: string;
  parcelle: string;
  ville: string;
  departement: string;
  dateModification: Date;
  margeBrute: number;
  eiq: number;
  nbAnnees: number;
  productions: string[];
  cahierDesCharges?: string;
  description: string;
  nbVariantes?: number;
}

interface ItineraryListProps {
  onNavigateToProject: (id: string) => void;
  onNavigateToWizard: () => void;
}

export function ItineraryList({ onNavigateToProject, onNavigateToWizard }: ItineraryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'marge' | 'eiq' | 'agriculteurs'>('date');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [farmerFilter, setFarmerFilter] = useState<string | null>(null);
  const [productionFilter, setProductionFilter] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeView, setActiveView] = useState<'my-systems' | 'explore'>('my-systems');
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [exploreItineraries, setExploreItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch systems from API
  useEffect(() => {
    const fetchSystems = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user's own systems
        const response = await fetch('/api/systems');
        if (!response.ok) throw new Error('Failed to fetch systems');
        const systems = await response.json();

        // Transform systems data to match Itinerary interface
        const transformedData: Itinerary[] = systems.map((system: any) => ({
          id: system.id.toString(),
          name: system.name || 'Système sans nom',
          farmer: system.farmer_name || 'Agriculteur inconnu',
          exploitation: system.farm_name || 'Exploitation inconnue',
          parcelle: system.description || '',
          ville: system.town || '',
          departement: '',
          dateModification: new Date(system.updated_at),
          margeBrute: 0,
          eiq: 0,
          nbAnnees: 0,
          productions: system.productions ? system.productions.split(',').map((p: string) => p.trim()) : [],
          cahierDesCharges: system.system_type || '',
          description: system.description || '',
          nbVariantes: 0
        }));

        setItineraries(transformedData);

        // Fetch other users' systems for explore view
        const exploreResponse = await fetch('/api/systems/explore');
        if (exploreResponse.ok) {
          const exploreSystems = await exploreResponse.json();
          
          const exploreTransformedData: Itinerary[] = exploreSystems.map((system: any) => ({
            id: system.id.toString(),
            name: system.name || 'Système sans nom',
            farmer: 'Agriculteur Anonyme',
            exploitation: 'Exploitation Anonyme',
            parcelle: system.description || '',
            ville: system.town || '',
            departement: '',
            dateModification: new Date(system.updated_at),
            margeBrute: 0,
            eiq: 0,
            nbAnnees: 0,
            productions: system.productions ? system.productions.split(',').map((p: string) => p.trim()) : [],
            cahierDesCharges: system.system_type || '',
            description: system.description || '',
            nbVariantes: 0
          }));
          
          setExploreItineraries(exploreTransformedData);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching systems:', err);
        setError('Erreur lors du chargement des systèmes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystems();
  }, []);

  // Filtered and sorted itineraries
  const filteredItineraries = useMemo(() => {
    // Use different data source based on active view
    const sourceData = activeView === 'explore' ? exploreItineraries : itineraries;
    let result = [...sourceData];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (it) =>
          it.name.toLowerCase().includes(query) ||
          it.farmer.toLowerCase().includes(query) ||
          it.ville.toLowerCase().includes(query) ||
          it.description.toLowerCase().includes(query) ||
          it.productions.some((p) => p.toLowerCase().includes(query))
      );
    }

    // Farmer filter
    if (farmerFilter) {
      result = result.filter((it) => it.farmer === farmerFilter);
    }

    // Production filter
    if (productionFilter) {
      result = result.filter((it) => it.productions.includes(productionFilter));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return b.dateModification.getTime() - a.dateModification.getTime();
      } else if (sortBy === 'marge') {
        return b.margeBrute - a.margeBrute;
      } else if (sortBy === 'eiq') {
        return a.eiq - b.eiq;
      } else {
        return a.farmer.localeCompare(b.farmer);
      }
    });

    return result;
  }, [itineraries, exploreItineraries, activeView, searchQuery, sortBy, farmerFilter, productionFilter]);

  // Group by farmer when agriculteurs sort is selected
  const groupedByFarmer = useMemo(() => {
    const groups: { [farmer: string]: Itinerary[] } = {};
    filteredItineraries.forEach((itinerary) => {
      if (!groups[itinerary.farmer]) {
        groups[itinerary.farmer] = [];
      }
      groups[itinerary.farmer].push(itinerary);
    });
    return groups;
  }, [filteredItineraries]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDelete = () => {
    if (confirm(`Supprimer ${selectedIds.size} système${selectedIds.size > 1 ? 's' : ''} de cultures ?`)) {
      // Delete logic here
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
  };

  const handleDuplicate = () => {
    // Duplicate logic here
    alert(`Dupliquer ${selectedIds.size} système${selectedIds.size > 1 ? 's' : ''} de cultures`);
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const clearFarmerFilter = () => setFarmerFilter(null);
  const clearProductionFilter = () => setProductionFilter(null);

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <TopBar
        variant="list"
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <main className="px-6 py-6">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#6b9571] mb-4"></div>
              <p className="text-gray-600">Chargement des systèmes...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Main content */}
        {!isLoading && !error && (
          <>
        {/* Page Title and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="mb-2">
              {activeView === 'my-systems' ? 'Liste des systèmes' : 'Explorer d\'autres systèmes'}
            </h1>
            <p className="text-gray-600">
              {filteredItineraries.length} système{filteredItineraries.length > 1 ? 's' : ''} de cultures
              {farmerFilter && ` • Agriculteur: ${farmerFilter}`}
              {productionFilter && ` • Production: ${productionFilter}`}
            </p>
          </div>
          <div className="flex gap-3">
            {activeView === 'my-systems' && (
              <>
                <button
                  onClick={() => {
                    setSelectionMode(!selectionMode);
                    setSelectedIds(new Set());
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    selectionMode
                      ? 'bg-[#6b9571] text-white border-[#6b9571]'
                      : 'bg-white border-gray-300 hover:border-[#6b9571]'
                  }`}
                >
                  <div className="size-5" style={{ '--fill-0': selectionMode ? '#ffffff' : '#707070' } as React.CSSProperties}>
                    <CheckBox />
                  </div>
                  Sélectionner
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#6b9571] text-white rounded-lg hover:bg-[#5a8560] transition-colors"
                >
                  <Plus className="size-5" />
                  Nouveau système de cultures
                </button>
              </>
            )}
          </div>
        </div>

        {/* Action buttons when items are selected */}
        {selectionMode && selectedIds.size > 0 && (
          <div className="bg-[#6b9571] text-white rounded-lg p-4 mb-6 flex items-center justify-between">
            <span>
              {selectedIds.size} système{selectedIds.size > 1 ? 's' : ''} de cultures sélectionné{selectedIds.size > 1 ? 's' : ''}
            </span>
            <div className="flex gap-3">
              <button
                onClick={handleDuplicate}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#6b9571] rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Copy className="size-5" />
                Dupliquer
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="size-5" />
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un système de cultures, agriculteur, ville, production..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#6b9571] focus:border-transparent"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-gray-700 whitespace-nowrap">
                Trié par :
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-4 pr-12 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6b9571] focus:border-transparent cursor-pointer p-[8px] mt-[0px] mr-[9px] mb-[0px] ml-[0px]"
              >
                <option value="date">Date</option>
                <option value="marge">Marge</option>
                <option value="eiq">EIQ</option>
                <option value="agriculteurs">Agriculteurs</option>
              </select>
            </div>
          </div>

          {/* Active filters */}
          {(farmerFilter || productionFilter) && (
            <div className="flex gap-2 mt-4">
              {farmerFilter && (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#6b9571] text-white rounded-full text-sm">
                  <span>Agriculteur: {farmerFilter}</span>
                  <button onClick={clearFarmerFilter} className="hover:text-gray-200">
                    ✕
                  </button>
                </div>
              )}
              {productionFilter && (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#6b9571] text-white rounded-full text-sm">
                  <span>Production: {productionFilter}</span>
                  <button onClick={clearProductionFilter} className="hover:text-gray-200">
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Itineraries Grid */}
        {sortBy === 'agriculteurs' ? (
          // Grouped by farmer view
          <div className="space-y-8">
            {Object.keys(groupedByFarmer).sort().map((farmer) => {
              const farmerItineraries = groupedByFarmer[farmer];
              const farmerExploitation = farmerItineraries[0]?.exploitation || '';

              return (
                <div key={farmer} className="space-y-4">
                  {/* Farmer header */}
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-[#6b9571]">
                    <div className="size-10 rounded-full bg-[#6b9571] flex items-center justify-center text-white">
                      {farmer.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h2 className="text-[#6b9571]">{farmer}</h2>
                      <p className="text-sm text-gray-600">{farmerExploitation} • {farmerItineraries.length} système{farmerItineraries.length > 1 ? 's' : ''} de cultures</p>
                    </div>
                  </div>

                  {/* Farmer's itineraries */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {farmerItineraries.map((itinerary) => (
                      <ItineraryCard
                        key={itinerary.id}
                        {...itinerary}
                        isSelected={selectedIds.has(itinerary.id)}
                        onSelect={toggleSelection}
                        onNavigate={onNavigateToProject}
                        onFilterByFarmer={setFarmerFilter}
                        onFilterByProduction={setProductionFilter}
                        selectionMode={selectionMode}
                        anonymized={activeView === 'explore'}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Normal grid view
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredItineraries.map((itinerary) => (
              <ItineraryCard
                key={itinerary.id}
                {...itinerary}
                isSelected={selectedIds.has(itinerary.id)}
                onSelect={toggleSelection}
                onNavigate={onNavigateToProject}
                onFilterByFarmer={setFarmerFilter}
                onFilterByProduction={setProductionFilter}
                selectionMode={selectionMode}
                anonymized={activeView === 'explore'}
              />
            ))}
          </div>
        )}

        {filteredItineraries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Aucun système de cultures trouvé</p>
          </div>
        )}
        </>
        )}
      </main>

      {/* Create Itinerary Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-gray-900 mb-6">Créer un nouveau système de cultures</h2>

              <div className="space-y-3">
                {/* Option 1: Créer depuis zéro */}
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    onNavigateToWizard();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-[#6b9571] text-white rounded-lg hover:bg-[#5a8560] transition-colors"
                >
                  <Plus className="size-5" />
                  <span>Créer un nouveau système de cultures</span>
                </button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-sm text-gray-500">ou importer depuis</span>
                  </div>
                </div>

                {/* Option 2: Importer JSON */}
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    alert('Import JSON - Fonctionnalité à implémenter');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#6b9571] hover:bg-gray-50 transition-colors"
                >
                  <FileJson className="size-5" />
                  <span>Importer un système de cultures (JSON)</span>
                </button>

                {/* Option 3: Geofolia */}
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    alert('Import Geofolia - Fonctionnalité à implémenter');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#6b9571] hover:bg-gray-50 transition-colors"
                >
                  <Wheat className="size-5" />
                  <span>Geofolia</span>
                </button>

                {/* Option 4: Mes Parcels */}
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    alert('Import Mes Parcels - Fonctionnalité à implémenter');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#6b9571] hover:bg-gray-50 transition-colors"
                >
                  <Wheat className="size-5" />
                  <span>MesParcelles</span>
                </button>
              </div>

              {/* Bouton Annuler */}
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}