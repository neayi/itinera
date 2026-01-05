import { Calendar, TrendingUp, Leaf, MapPin } from 'lucide-react';

interface ItineraryCardProps {
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
  isSelected: boolean;
  onSelect: (id: string) => void;
  onNavigate: (id: string) => void;
  onFilterByFarmer: (farmer: string) => void;
  onFilterByProduction: (production: string) => void;
  selectionMode: boolean;
  anonymized?: boolean;
  nbVariantes?: number;
}

export function ItineraryCard({
  id,
  name,
  farmer,
  exploitation,
  parcelle,
  ville,
  departement,
  dateModification,
  margeBrute,
  eiq,
  nbAnnees,
  productions,
  cahierDesCharges,
  description,
  isSelected,
  onSelect,
  onNavigate,
  onFilterByFarmer,
  onFilterByProduction,
  selectionMode,
  anonymized,
  nbVariantes
}: ItineraryCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const productionColors: Record<string, string> = {
    'Blé': 'bg-amber-100 text-amber-800',
    'Orge': 'bg-orange-100 text-orange-800',
    'Maïs': 'bg-yellow-100 text-yellow-800',
    'Colza': 'bg-lime-100 text-lime-800',
    'Luzerne': 'bg-purple-100 text-purple-800',
    'Quinoa': 'bg-cyan-100 text-cyan-800',
    'Prairie': 'bg-green-100 text-green-800'
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-[#6b9571] shadow-md'
          : 'border-gray-200 hover:border-[#6b9571] hover:shadow-sm'
      }`}
      onClick={() => !selectionMode && onNavigate(id)}
    >
      <div className="p-6">
        {/* Header with checkbox */}
        <div className="flex items-start gap-4 mb-4">
          {selectionMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(id);
              }}
              className="mt-1 size-5 rounded border-gray-300 text-[#6b9571] focus:ring-[#6b9571]"
            />
          )}
          <div className="flex-1">
            {!anonymized && <h3 className="mb-2 text-[#6b9571]">{farmer}</h3>}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!anonymized) {
                  onFilterByFarmer(farmer);
                }
              }}
              className={anonymized ? "text-gray-700" : "text-gray-700 hover:text-[#6b9571] hover:underline"}
            >
              {name}
              {nbVariantes != undefined && nbVariantes > 0 && (
                <span className="text-gray-500"> - {nbVariantes} variante{nbVariantes > 1 ? 's' : ''}</span>
              )}
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">{description}</p>

        {/* Productions tags with cahier des charges */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {cahierDesCharges && (
            <>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                {cahierDesCharges}
              </span>
              <span className="text-gray-400 text-sm">:</span>
            </>
          )}
          {productions.map((production) => (
            <button
              key={production}
              onClick={(e) => {
                e.stopPropagation();
                onFilterByProduction(production);
              }}
              className={`px-3 py-1 rounded-full text-sm transition-transform hover:scale-105 ${
                productionColors[production] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {production}
            </button>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div>
            <div className="flex items-center gap-1 text-gray-600 text-sm mb-1">
              <Calendar className="size-4" />
              <span>Modifié</span>
            </div>
            <div className="text-sm">{formatDate(dateModification)}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-600 text-sm mb-1">
              <TrendingUp className="size-4" />
              <span>Marge brute</span>
            </div>
            <div className="text-[#6b9571]">{margeBrute.toLocaleString()} €</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-600 text-sm mb-1">
              <Leaf className="size-4" />
              <span>EIQ</span>
            </div>
            <div className={eiq <= 20 ? 'text-green-600' : eiq <= 40 ? 'text-orange-600' : 'text-red-600'}>
              {eiq.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-gray-600 text-sm mb-1">Période</div>
            <div>{nbAnnees} {nbAnnees > 1 ? 'ans' : 'an'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}