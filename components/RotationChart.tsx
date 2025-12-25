import { useState, useRef, useEffect } from 'react';

interface Intervention {
  title: string;
  date: string;
  dateObj: Date;
  description?: string;
  dayOffset: number;
}

interface RotationPeriod {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
  interventions: Intervention[];
}

interface TooltipData {
  intervention: Intervention;
  color: string;
  x: number;
  y: number;
}

export function RotationChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 953, height: 500 });

  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const width = chartRef.current.offsetWidth;
        setChartDimensions({ width, height: 500 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const rotationPeriods: RotationPeriod[] = [
    {
      id: 0,
      name: 'Orge + Lupin',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-07-20'),
      color: '#d2b48c',
      interventions: [
        { title: 'Labour', date: '24 févr. 2026', dateObj: new Date('2026-02-24'), description: '', dayOffset: -5 },
        { title: 'Fauche, andainage puis récolte', date: '20 juil. 2026', dateObj: new Date('2026-07-20'), description: 'Récolte avec broyage des pailles une semaine après la fauche. Les pailles sont laissées au sol.', dayOffset: 141 },
        { title: 'Digestat solide', date: '1 mars 2026', dateObj: new Date('2026-03-01'), description: 'Epandage de digestat solide 7T/ha en Fevrier dans le couvert de phacélie', dayOffset: 0 }
      ]
    },
    {
      id: 1,
      name: 'Luzerne + trèfle violet et blanc',
      startDate: new Date('2026-07-20'),
      endDate: new Date('2028-10-15'),
      color: '#2d9f6e',
      interventions: [
        { title: 'Destruction au combiné au moment d\'implanter la CIVE', date: '15 oct. 2028', dateObj: new Date('2028-10-15'), description: '', dayOffset: 818 },
        { title: 'Digestat', date: '15 mai 2027', dateObj: new Date('2027-05-15'), description: 'Epandage de digestat 20m³/ha', dayOffset: 299 },
        { title: 'Engrais potassique', date: '15 mars 2027', dateObj: new Date('2027-03-15'), description: 'Epandage de 200kg/ha de chlorure de potassium', dayOffset: 238 },
        { title: 'Semis associé', date: '1 mars 2026', dateObj: new Date('2026-03-01'), description: 'Semis associé de la luzerne à la volée', dayOffset: -141 },
        { title: 'Digestat', date: '15 mai 2028', dateObj: new Date('2028-05-15'), description: 'Epandage de digestat 20m³/ha', dayOffset: 665 },
        { title: 'Engrais potassique', date: '15 mars 2028', dateObj: new Date('2028-03-15'), description: 'Epandage de 200kg/ha de chlorure de potassium', dayOffset: 604 }
      ]
    },
    {
      id: 2,
      name: 'CIVE (Triticale)',
      startDate: new Date('2028-10-15'),
      endDate: new Date('2029-04-15'),
      color: '#d2b48c',
      interventions: [
        { title: 'Ensilage', date: '15 avr. 2029', dateObj: new Date('2029-04-15'), description: '', dayOffset: 182 },
        { title: 'Digestat liquide', date: '15 févr. 2029', dateObj: new Date('2029-02-15'), description: 'Epandage de digestat liquide, 20m³/ha en février, si possible au sans tonne', dayOffset: 123 }
      ]
    },
    {
      id: 3,
      name: 'Quinoa',
      startDate: new Date('2029-05-10'),
      endDate: new Date('2029-09-15'),
      color: '#d9c9b6',
      interventions: [
        { title: 'Labour', date: '5 mai 2029', dateObj: new Date('2029-05-05'), description: '', dayOffset: -5 },
        { title: 'Digestat liquide', date: '10 mai 2029', dateObj: new Date('2029-05-10'), description: 'Epandage de digestat à l\'enfouisseur - 20m3/ha', dayOffset: 0 },
        { title: 'Binage x 2', date: '25 mai 2029', dateObj: new Date('2029-05-25'), description: 'Binage et semis du trèfle à la volée avec le deuxième', dayOffset: 15 }
      ]
    },
    {
      id: 4,
      name: 'Trèfle blanc',
      startDate: new Date('2029-06-01'),
      endDate: new Date('2029-11-15'),
      color: '#d6d6d6',
      interventions: []
    },
    {
      id: 5,
      name: 'Blé + féverole',
      startDate: new Date('2029-11-15'),
      endDate: new Date('2030-07-15'),
      color: '#d2b48c',
      interventions: [
        { title: 'Labour', date: '10 nov. 2029', dateObj: new Date('2029-11-10'), description: '', dayOffset: -5 },
        { title: 'Digestat liquide', date: '20 févr. 2030', dateObj: new Date('2030-02-20'), description: 'Epandage de digestat liquide, 25m3/ha, février ou mars au pendillard, si possible au sans tonne.', dayOffset: 97 },
        { title: 'Herse étrille', date: '15 mars 2030', dateObj: new Date('2030-03-15'), description: '2 à 3 passage de herse étrille début de printemps, dont 1 fois en double passage rapprochés.', dayOffset: 120 },
        { title: 'Herse étrille', date: '15 avr. 2030', dateObj: new Date('2030-04-15'), description: '2 à 3 passage de herse étrille début de printemps, dont 1 fois en double passage rapprochés.', dayOffset: 151 },
        { title: 'Moisson en mode fauchage andainage', date: '15 juil. 2030', dateObj: new Date('2030-07-15'), description: 'Moisson en mode fauchage andainage et caisson de récupération de menue paille sur la moissonneuse, la paille est utilisé pour les animaux', dayOffset: 242 }
      ]
    },
    {
      id: 6,
      name: 'Colza + sarrasin',
      startDate: new Date('2030-08-15'),
      endDate: new Date('2031-06-15'),
      color: '#ffd700',
      interventions: [
        { title: 'Déchaumage', date: '10 août 2030', dateObj: new Date('2030-08-10'), description: '', dayOffset: -5 },
        { title: 'Epandage digestat', date: '15 août 2030', dateObj: new Date('2030-08-15'), description: 'Epandage digestat solide et liquide', dayOffset: 0 },
        { title: 'Labour', date: '15 août 2030', dateObj: new Date('2030-08-15'), description: '', dayOffset: 0 },
        { title: 'Fauchage andainage', date: '15 juin 2031', dateObj: new Date('2031-06-15'), description: 'Fauchage du colza vers le 15 juin et récolte 10jours plus tard', dayOffset: 304 }
      ]
    },
    {
      id: 7,
      name: 'Ray-grass italien + trèfle',
      startDate: new Date('2031-06-15'),
      endDate: new Date('2032-04-15'),
      color: '#4caf50',
      interventions: [
        { title: 'Broyages x 2', date: '30 août 2031', dateObj: new Date('2031-08-30'), description: '2 broyages sur fin été et automne pour apporter de la matière verte au sol', dayOffset: 76 },
        { title: 'Enrubannage', date: '1 avr. 2032', dateObj: new Date('2032-04-01'), description: 'Enrubannage de la dérobé RGI/trèfle début avril', dayOffset: 291 }
      ]
    },
    {
      id: 8,
      name: 'Maïs',
      startDate: new Date('2032-05-10'),
      endDate: new Date('2032-09-15'),
      color: '#ffd700',
      interventions: [
        { title: 'Digestat liquide', date: '5 mai 2032', dateObj: new Date('2032-05-05'), description: 'Epandage digestat liquide 35m³/ha à l\'enfouisseur', dayOffset: -5 },
        { title: 'Labour', date: '10 mai 2032', dateObj: new Date('2032-05-10'), description: '', dayOffset: 0 },
        { title: 'Herse étrille', date: '15 mai 2032', dateObj: new Date('2032-05-15'), description: '', dayOffset: 5 },
        { title: 'Houe rotative', date: '24 mai 2032', dateObj: new Date('2032-05-24'), description: 'Houe rotative 7 à 10 jours après la herse étrille', dayOffset: 14 },
        { title: 'Binage', date: '31 mai 2032', dateObj: new Date('2032-05-31'), description: '', dayOffset: 21 },
        { title: 'Binage', date: '7 juin 2032', dateObj: new Date('2032-06-07'), description: '', dayOffset: 28 }
      ]
    },
    {
      id: 9,
      name: 'Phacélie',
      startDate: new Date('2032-09-15'),
      endDate: new Date('2033-05-15'),
      color: '#a7c6ed',
      interventions: []
    }
  ];

  // Calculate timeline parameters
  const startDate = new Date('2026-01-01');
  const endDate = new Date('2033-12-31');
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const padding = { top: 40, right: 40, bottom: 60, left: 120 };
  const chartWidth = chartDimensions.width - padding.left - padding.right;
  const chartHeight = chartDimensions.height - padding.top - padding.bottom;
  const barHeight = 30;
  const barSpacing = 10;

  const dateToX = (date: Date) => {
    const daysSinceStart = Math.ceil((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return padding.left + (daysSinceStart / totalDays) * chartWidth;
  };

  const handleInterventionHover = (intervention: Intervention, color: string, event: React.MouseEvent) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        intervention,
        color,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div ref={chartRef} className="relative w-full" style={{ height: '500px', cursor: 'pointer', userSelect: 'none' }}>
      <svg width={chartDimensions.width} height={chartDimensions.height} className="w-full h-full">
        {/* Year labels */}
        {[2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033].map((year) => {
          const yearDate = new Date(`${year}-01-01`);
          const x = dateToX(yearDate);
          return (
            <g key={year}>
              <line
                x1={x}
                y1={padding.top}
                x2={x}
                y2={chartDimensions.height - padding.bottom}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={x}
                y={padding.top - 10}
                textAnchor="middle"
                fill="#6b7280"
                fontSize="12"
              >
                {year}
              </text>
            </g>
          );
        })}

        {/* Rotation bars */}
        {rotationPeriods.map((period, index) => {
          const x = dateToX(period.startDate);
          const width = dateToX(period.endDate) - x;
          const y = padding.top + index * (barHeight + barSpacing);

          return (
            <g key={period.id}>
              {/* Period bar */}
              <rect
                x={x}
                y={y}
                width={width}
                height={barHeight}
                fill={period.color}
                opacity={0.7}
                rx={4}
              />
              
              {/* Period label */}
              <text
                x={padding.left - 10}
                y={y + barHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#374151"
                fontSize="12"
              >
                {period.name}
              </text>

              {/* Intervention markers */}
              {period.interventions.map((intervention, idx) => {
                const interventionX = dateToX(intervention.dateObj);
                return (
                  <g key={idx}>
                    <circle
                      cx={interventionX}
                      cy={y + barHeight / 2}
                      r={5}
                      fill="#ef4444"
                      stroke="#fff"
                      strokeWidth="2"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => handleInterventionHover(intervention, period.color, e)}
                      onMouseLeave={handleMouseLeave}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Timeline axis */}
        <line
          x1={padding.left}
          y1={chartDimensions.height - padding.bottom}
          x2={chartDimensions.width - padding.right}
          y2={chartDimensions.height - padding.bottom}
          stroke="#9ca3af"
          strokeWidth="2"
        />
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="rotation-tooltip"
          style={{
            position: 'absolute',
            display: 'block',
            borderStyle: 'solid',
            whiteSpace: 'normal',
            zIndex: 9999999,
            willChange: 'transform',
            boxShadow: 'rgba(0, 0, 0, 0.2) 1px 2px 10px',
            backgroundColor: 'rgb(255, 255, 255)',
            borderWidth: '1px',
            borderRadius: '4px',
            color: 'rgb(109, 110, 115)',
            font: '14px / 21px sans-serif',
            padding: '10px',
            top: '0px',
            left: '0px',
            transform: `translate3d(${tooltip.x + 15}px, ${tooltip.y + 15}px, 0px)`,
            borderColor: tooltip.color,
            pointerEvents: 'none'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              marginRight: '4px',
              borderRadius: '10px',
              width: '10px',
              height: '10px',
              backgroundColor: tooltip.color
            }}
          />
          <b>{tooltip.intervention.title}</b> - {tooltip.intervention.date} (J{tooltip.intervention.dayOffset >= 0 ? '+' : ''}{tooltip.intervention.dayOffset})
          {tooltip.intervention.description && (
            <>
              <br />
              {tooltip.intervention.description}
            </>
          )}
        </div>
      )}
    </div>
  );
}
