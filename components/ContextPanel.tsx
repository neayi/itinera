import { MapPin, FileText } from 'lucide-react';
import { SoilPropertiesPanel } from './SoilPropertiesPanel';
import { OmbrothermalChart } from './OmbrothermalChart';
import dynamic from 'next/dynamic';

// Import dynamique du composant Map pour éviter les problèmes SSR
const Map = dynamic(() => import('./MapLeaflet').then(mod => ({ default: mod.Map })), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center">Chargement de la carte...</div>
});

export function ContextPanel() {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2>Informations de contexte</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-sm">
            <FileText className="size-4" />
            Rapport économique
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-sm">
            <FileText className="size-4" />
            Rapport environnemental
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Map */}
        <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200 h-80">
          <div className="relative w-full h-full">
            <Map latitude={47.063545} longitude={-1.326997} zoom={14} />
            <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs shadow-md z-[1000]">
              Parcelles: 42.5 ha
            </div>
          </div>
        </div>

        {/* Soil Properties */}
        <SoilPropertiesPanel />

        {/* Ombrothermal Chart */}
        <OmbrothermalChart />
      </div>
    </section>
  );
}