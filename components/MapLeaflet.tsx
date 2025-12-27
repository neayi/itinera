'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

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

interface MapProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  className?: string;
}

export function Map({
  latitude = 47.063545,
  longitude = -1.326997,
  zoom = 14,
  className = ''
}: MapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !mapRef.current) return;

    // Vérifier si la carte existe déjà
    if (mapInstanceRef.current) return;

    // Créer la carte avec l'API Leaflet directe
    const map = L.map(mapRef.current).setView([latitude, longitude], zoom);

    // Ajouter le layer de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Ajouter le marqueur
    L.marker([latitude, longitude], { icon }).addTo(map)
      .bindPopup('Localisation de la parcelle');

    mapInstanceRef.current = map;

    // Cleanup: supprimer la carte lors du démontage
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMounted, latitude, longitude, zoom]);

  if (!isMounted) {
    return (
      <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
        Chargement de la carte...
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ height: '100%', width: '100%' }}
    />
  );
}
