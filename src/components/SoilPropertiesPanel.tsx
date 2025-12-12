import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { SoilPropertiesModal } from './SoilPropertiesModal';

export function SoilPropertiesPanel() {
  const [expandedPhysical, setExpandedPhysical] = useState(true);
  const [expandedChemical, setExpandedChemical] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const soilData = {
    physical: {
      texture: 'Limon argileux',
      profondeur: '80 cm',
      drainage: 'Bon',
      porosite: '45%',
      reserve_utile: '150 mm'
    },
    chemical: {
      ph: 6.8,
      matiere_organique: '2.8%',
      azote_total: '0.15%',
      phosphore: '65 mg/kg',
      potassium: '185 mg/kg',
      cec: '18 cmol/kg'
    },
    classification: 'Fluvisols'
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-80 flex flex-col">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm">Propriétés du sol</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-[#4a6ad4] underline hover:text-[#3a5ac4] transition-colors"
          >
            Modifier
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Classification */}
          <div className="pb-3 border-b border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Classification WRB</div>
            <div className="bg-blue-50 px-3 py-2 rounded">
              {soilData.classification}
            </div>
          </div>

          {/* Physical Properties */}
          <div>
            <button
              onClick={() => setExpandedPhysical(!expandedPhysical)}
              className="flex items-center justify-between w-full text-sm mb-2"
            >
              <span>Propriétés physiques</span>
              {expandedPhysical ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            {expandedPhysical && (
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Texture</span>
                  <span>{soilData.physical.texture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profondeur</span>
                  <span>{soilData.physical.profondeur}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Drainage</span>
                  <span>{soilData.physical.drainage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Porosité</span>
                  <span>{soilData.physical.porosite}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Réserve utile</span>
                  <span>{soilData.physical.reserve_utile}</span>
                </div>
              </div>
            )}
          </div>

          {/* Chemical Properties */}
          <div>
            <button
              onClick={() => setExpandedChemical(!expandedChemical)}
              className="flex items-center justify-between w-full text-sm mb-2"
            >
              <span>Propriétés chimiques</span>
              {expandedChemical ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            {expandedChemical && (
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">pH</span>
                  <span>{soilData.chemical.ph}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Matière organique</span>
                  <span>{soilData.chemical.matiere_organique}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Azote total</span>
                  <span>{soilData.chemical.azote_total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phosphore (P2O5)</span>
                  <span>{soilData.chemical.phosphore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Potassium (K2O)</span>
                  <span>{soilData.chemical.potassium}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CEC</span>
                  <span>{soilData.chemical.cec}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SoilPropertiesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}