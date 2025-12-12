import { MapPin, FileText } from 'lucide-react';
import { SoilPropertiesPanel } from './SoilPropertiesPanel';
import { OmbrothermalChart } from './OmbrothermalChart';

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
            {/* Google Maps iframe */}
            <iframe
              src="https://maps.google.com/maps?q=47.063545,-1.326997&hl=fr&z=14&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            ></iframe>
            <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs shadow-md">
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