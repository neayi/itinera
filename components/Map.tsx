'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

interface MapProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  className?: string;
}

function MapComponent({
  latitude = 47.063545,
  longitude = -1.326997,
  zoom = 14,
  className = ''
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Import dynamique de Leaflet côté client uniquement
    import('leaflet').then((L) => {
      // Fix pour les icônes de marqueurs Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      // Créer la carte
      const map = L.map(mapRef.current).setView([latitude, longitude], zoom);

      // Ajouter la couche de tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Ajouter un marqueur
      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup('Localisation de la parcelle')
        .openPopup();

      mapInstanceRef.current = map;
    });

    // Nettoyage lors du démontage du composant
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom]);

  return <div ref={mapRef} className={`w-full h-full ${className}`} />;
}

// Export avec chargement dynamique sans SSR
export const Map = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center">Chargement de la carte...</div>
});
