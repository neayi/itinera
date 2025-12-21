import { useEffect, useRef } from 'react';

interface ItineraireTechniqueProps {
  dataUrl?: string;
  className?: string;
}

export function ItineraireTechnique({
  dataUrl = '/src/data/une-rotation-de-test.json',
  className = ''
}: ItineraireTechniqueProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Charger les données et initialiser le renderer
    fetch(dataUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Vérifier que RotationRenderer est disponible
        if (typeof (window as any).RotationRenderer !== 'undefined') {
          const chartId = containerRef.current?.id || 'rotation-chart';
          rendererRef.current = new (window as any).RotationRenderer(chartId, data);
          rendererRef.current.render();
        } else {
          console.error('RotationRenderer non disponible. Assurez-vous que chart-render.js est chargé.');
        }
      })
      .catch(error => {
        console.error('Impossible de charger le JSON :', error);
      });

    // Cleanup
    return () => {
      if (rendererRef.current && typeof rendererRef.current.dispose === 'function') {
        rendererRef.current.dispose();
      }
    };
  }, [dataUrl]);

  return (
    <div
      id="rotation-chart"
      ref={containerRef}
      className={className}
      style={{ minHeight: '400px', width: '100%' }}
    />
  );
}
