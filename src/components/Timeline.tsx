import { useRef, useState, useEffect } from 'react';
import { RotationData, InterventionData } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TimelineProps {
  rotationData: RotationData[];
  interventions: InterventionData[];
}

export function Timeline({ rotationData, interventions }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [zoom, setZoom] = useState(1);

  const startYear = 2027;
  const endYear = 2033;
  const totalYears = endYear - startYear;
  const pixelsPerYear = 400 * zoom;

  const handleScroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      containerRef.current.scrollLeft = newPosition;
      setScrollPosition(newPosition);
    }
  };

  const getPositionFromDate = (date: Date) => {
    const yearFraction = date.getFullYear() - startYear + 
      (date.getMonth() / 12) + 
      (date.getDate() / 365);
    return yearFraction * pixelsPerYear;
  };

  const getWidthFromDates = (start: Date, end: Date) => {
    return getPositionFromDate(end) - getPositionFromDate(start);
  };

  // Group interventions by category
  const interventionsByCategory = interventions.reduce((acc, intervention) => {
    if (!acc[intervention.category]) {
      acc[intervention.category] = [];
    }
    acc[intervention.category].push(intervention);
    return acc;
  }, {} as Record<string, InterventionData[]>);

  return (
    <div className="relative">
      {/* Zoom controls */}
      <div className="absolute top-0 right-0 flex gap-2 mb-2 z-10">
        <button 
          onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          -
        </button>
        <span className="px-2 py-1 bg-white border border-gray-300 rounded text-sm">
          {Math.round(zoom * 100)}%
        </span>
        <button 
          onClick={() => setZoom(Math.min(2, zoom + 0.25))}
          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          +
        </button>
      </div>

      {/* Scroll buttons */}
      <button 
        onClick={() => handleScroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:bg-gray-50"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button 
        onClick={() => handleScroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:bg-gray-50"
      >
        <ChevronRight className="size-4" />
      </button>

      {/* Timeline container */}
      <div 
        ref={containerRef}
        className="overflow-x-auto overflow-y-visible pb-4 pt-12"
        style={{ maxHeight: '600px' }}
      >
        <div style={{ width: `${totalYears * pixelsPerYear}px`, position: 'relative', minHeight: '400px' }}>
          
          {/* Year markers */}
          <div className="absolute top-0 left-0 right-0 h-8 border-b border-gray-300">
            {Array.from({ length: totalYears + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 h-8 border-l border-gray-300"
                style={{ left: `${i * pixelsPerYear}px` }}
              >
                <span className="absolute -top-6 -left-4 text-sm">{startYear + i}</span>
              </div>
            ))}
          </div>

          {/* Month markers */}
          <div className="absolute top-8 left-0 right-0 h-6 border-b border-gray-200">
            {Array.from({ length: totalYears * 12 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 h-6 border-l border-gray-100"
                style={{ left: `${(i / 12) * pixelsPerYear}px` }}
              >
                {i % 3 === 0 && (
                  <span className="absolute top-0 left-1 text-xs text-gray-400">
                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i % 12]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Rotations (main cultures) */}
          <div className="absolute top-20 left-0 right-0" style={{ height: '80px' }}>
            <div className="text-xs text-gray-600 mb-1 ml-2">Cultures principales</div>
            {rotationData.map(rotation => (
              <div
                key={rotation.id}
                className="absolute top-6 h-16 rounded flex items-center justify-center text-white shadow-md transition-all hover:shadow-lg"
                style={{
                  left: `${getPositionFromDate(rotation.startDate)}px`,
                  width: `${getWidthFromDates(rotation.startDate, rotation.endDate)}px`,
                  backgroundColor: rotation.color,
                }}
              >
                <span className="text-sm px-2">{rotation.name}</span>
              </div>
            ))}
          </div>

          {/* Interventions layer */}
          <div className="absolute top-52 left-0 right-0" style={{ minHeight: '200px' }}>
            <div className="text-xs text-gray-600 mb-1 ml-2">Interventions</div>
            {Object.entries(interventionsByCategory).map(([category, categoryInterventions], categoryIndex) => (
              <div key={category} className="relative mb-8" style={{ top: `${categoryIndex * 40}px` }}>
                {categoryInterventions.map(intervention => {
                  const position = getPositionFromDate(intervention.date);
                  return (
                    <div
                      key={intervention.id}
                      className="absolute top-6 h-6 bg-blue-500 rounded text-white text-xs px-2 flex items-center shadow hover:shadow-md transition-all cursor-pointer"
                      style={{
                        left: `${position}px`,
                        minWidth: '80px'
                      }}
                      title={`${intervention.name} - ${intervention.date.toLocaleDateString('fr-FR')}`}
                    >
                      {intervention.name}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Key operations markers */}
          <div className="absolute left-0 right-0" style={{ top: '420px', height: '60px' }}>
            <div className="text-xs text-gray-600 mb-1 ml-2">Opérations clés</div>
            {interventions
              .filter(i => ['Moisson', 'Labour', 'Semis', 'Semis associé'].includes(i.name))
              .map(intervention => (
                <div
                  key={`key-${intervention.id}`}
                  className="absolute top-6 w-1 h-8 bg-red-500"
                  style={{
                    left: `${getPositionFromDate(intervention.date)}px`,
                  }}
                  title={`${intervention.name}`}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
