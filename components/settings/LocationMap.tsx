'use client';

import { useEffect, useRef, useState } from 'react';

interface LocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationChange?: (lat: number, lng: number) => void;
  className?: string;
}

export function LocationMap({
  latitude,
  longitude,
  onLocationChange,
  className = ''
}: LocationMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const LeafletRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialisation de la carte (une seule fois)
  useEffect(() => {
    console.log('🗺️ Init effect:', { isMounted, hasMapRef: !!mapRef.current, isMapReady });
    if (!isMounted || !mapRef.current || isMapReady) return;

    console.log('🗺️ Starting Leaflet import...');
    // Import dynamique de Leaflet côté client uniquement
    import('leaflet').then((L) => {
      console.log('🗺️ Leaflet imported successfully');
      LeafletRef.current = L;

      const defaultLat = latitude || 46.603354;
      const defaultLng = longitude || 1.888334;
      
      console.log('🗺️ Creating map with coords:', { defaultLat, defaultLng });
      const map = L.map(mapRef.current!).setView([defaultLat, defaultLng], latitude && longitude ? 13 : 6);

      // Ajouter le layer de tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      console.log('🗺️ Map instance set:', mapInstanceRef.current);
      setIsMapReady(true);
      console.log('🗺️ Map ready!');
    }).catch(err => {
      console.error('🗺️ Error importing Leaflet:', err);
    });

    // Cleanup: supprimer la carte lors du démontage du composant
    return () => {
      console.log('🗺️ Cleanup called');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isMounted]); // Retirer isMapReady des dépendances !

  // Mise à jour du marqueur quand les coordonnées changent
  useEffect(() => {
    console.log('📍 Marker effect:', { isMapReady, hasLeaflet: !!LeafletRef.current, latitude, longitude });
    if (!isMapReady || !LeafletRef.current || !latitude || !longitude) return;

    const map = mapInstanceRef.current;
    if (!map) {
      console.log('📍 No map instance yet');
      return;
    }

    const L = LeafletRef.current;

    // Fix pour les icônes de marqueurs Leaflet
    const icon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    if (markerRef.current) {
      // Mettre à jour la position du marqueur existant sans changer le zoom
      markerRef.current.setLatLng([latitude, longitude]);
      map.panTo([latitude, longitude]);
    } else {
      // Créer un nouveau marqueur
      const marker = L.marker([latitude, longitude], { 
        icon,
        draggable: true 
      }).addTo(map);

      marker.bindPopup('Déplacez le marqueur pour ajuster la position');

      // Événement de déplacement du marqueur
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        if (onLocationChange) {
          onLocationChange(position.lat, position.lng);
        }
      });

      markerRef.current = marker;
      map.setView([latitude, longitude], 13);
    }
  }, [isMapReady, latitude, longitude, onLocationChange]);

  if (!isMounted) {
    return (
      <div className={`w-full h-full bg-gray-100 flex items-center justify-center rounded ${className}`}>
        <span className="text-gray-500 text-sm">Chargement...</span>
      </div>
    );
  }

  if (!latitude || !longitude) {
    return (
      <div className={`w-full h-full bg-gray-100 flex items-center justify-center rounded ${className}`}>
        <span className="text-gray-500 text-sm text-center">
          Saisissez des coordonnées<br />pour afficher la carte
        </span>
      </div>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"
      />
      <div
        ref={mapRef}
        className={`rounded ${className}`}
        style={{ height: '100%', width: '100%' }}
      />
    </>
  );
}
