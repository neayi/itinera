import { useEffect, useRef } from 'react';

interface ItineraireTechniqueProps {
  data?: any;
  dataUrl?: string;
  className?: string;
}

export function ItineraireTechnique({
  data,
  dataUrl,
  className = ''
}: ItineraireTechniqueProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initRenderer = (rotationData: any) => {
      // Vérifier que RotationRenderer est disponible
      if (typeof (window as any).RotationRenderer !== 'undefined') {
        const chartId = containerRef.current?.id || 'rotation-chart';
        rotationData.options.show_transcript = false;
        rendererRef.current = new (window as any).RotationRenderer(chartId, rotationData);
        rendererRef.current.render();
      } else {
        console.error('RotationRenderer non disponible. Assurez-vous que chart-render.js est chargé.');
      }
    };

    // Si data est fourni directement, l'utiliser
    if (data) {
      initRenderer(data);
    }
    // Sinon, charger depuis dataUrl
    else if (dataUrl) {
      fetch(dataUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
          }
          return response.json();
        })
        .then(rotationData => {
          initRenderer(rotationData);
        })
        .catch(error => {
          console.error('Impossible de charger le JSON :', error);
        });
    }

    // Cleanup
    return () => {
      if (rendererRef.current && typeof rendererRef.current.dispose === 'function') {
        rendererRef.current.dispose();
      }
    };
  }, [data, dataUrl]);

  return (
    <div
      id="rotation-chart"
      ref={containerRef}
      className={className}
      style={{ minHeight: '400px', width: '100%' }}
    />
  );
}
