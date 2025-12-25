import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface RotationStep {
  id: number;
  name: string;
  duration: string;
  dates: string;
  color: string;
  description: string;
  details?: {
    [key: string]: string;
  };
  interventions: {
    title: string;
    date: string;
    description?: string;
  }[];
  highlighted?: boolean;
}

export function RotationTimeline() {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));

  const toggleStep = (id: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const rotationSteps: RotationStep[] = [
    {
      id: 0,
      name: 'Orge + Lupin',
      duration: '5 mois',
      dates: '1 mars 26 ➜ 20 juil. 26',
      color: '#d2b48c',
      description: `Lupin (350 kg/ha) + Orge (50 kg/ha) dans la ligne de semis après un labour
Rendement orge : 14,25 qx/ha
Rendement lupin : 10,25 qx/ha

Le couvert luzerne/trèfle est semé à la volée avec le combiné.

Pas de desherbage en dehors du labour.

Après moisson, les pailles sont laissées au sol pour restitution de MO.

Lupin vendu pour l'alimentation animale ou la production de steaks végétaux`,
      details: {
        'Travail du sol': 'Labour',
        'Type de semoir': 'Combiné'
      },
      interventions: [
        { title: 'Labour', date: '24 févr. 2026 (J-5)', description: '' },
        { title: 'Fauche, andainage puis récolte', date: '20 juil. 2026 (J+141)', description: 'Récolte avec broyage des pailles une semaine après la fauche. Les pailles sont laissées au sol.' },
        { title: 'Digestat solide', date: '1 mars 2026 (J+0)', description: 'Epandage de digestat solide 7T/ha en Fevrier dans le couvert de phacélie' }
      ]
    },
    {
      id: 1,
      name: 'Luzerne + trèfle violet et blanc',
      duration: '27 mois',
      dates: '20 juil. 26 ➜ 15 oct. 28',
      color: '#2d9f6e',
      description: `Semis à la volée avec le combiné :
* Luzerne à 25kg/ha
* Trèfle violet à 3,5kg/ha
* Trèfle blanc à 1,5kg/ha

Rendement luzerne : 12 tMS/ha

Première coupe pour la métha, les trois coupes suivantes pour deshyouest, la 5ème, pour un voisin bio en enrubannage`,
      details: {
        'Rendement': '12TMS/ha au total sur les 3 ans'
      },
      interventions: [
        { title: 'Destruction au combiné au moment d\'implanter la CIVE', date: '15 oct. 2028 (J+818)', description: '' },
        { title: 'Digestat', date: '15 mai 2027 (J+299)', description: 'Epandage de digestat 20m³/ha' },
        { title: 'Engrais potassique', date: '15 mars 2027 (J+238)', description: 'Epandage de 200kg/ha de chlorure de potassium' },
        { title: 'Semis associé', date: '1 mars 2026 (J-141)', description: 'Semis associé de la luzerne à la volée' },
        { title: 'Digestat', date: '15 mai 2028 (J+665)', description: 'Epandage de digestat 20m³/ha' },
        { title: 'Engrais potassique', date: '15 mars 2028 (J+604)', description: 'Epandage de 200kg/ha de chlorure de potassium' }
      ]
    },
    {
      id: 2,
      name: 'CIVE (Triticale)',
      duration: '6 mois',
      dates: '15 oct. 28 ➜ 15 avr. 29',
      color: '#d2b48c',
      description: `Semis à 100kg/ha, au combiné :
* Cultivateur à l'avant
* A l'arrière, fissurateur à 15cm de profondeur
* Herse rotative
* Ligne de semis`,
      interventions: [
        { title: 'Ensilage', date: '15 avr. 2029 (J+182)', description: '' },
        { title: 'Digestat liquide', date: '15 févr. 2029 (J+123)', description: 'Epandage de digestat liquide, 20m³/ha en février, si possible au sans tonne' }
      ]
    },
    {
      id: 3,
      name: 'Quinoa',
      duration: '4 mois',
      dates: '10 mai 29 ➜ 15 sept. 29',
      color: '#d9c9b6',
      description: `Rendement : 1,2 t/ha

Labour avant le semis, éventuellement un vibro ou rouleau si le sol est séchant.

Semis à 10kg/ha (au combiné) en monograine en 50cm d'écartement`,
      interventions: [
        { title: 'Labour', date: '5 mai 2029 (J-5)', description: '' },
        { title: 'Digestat liquide', date: '10 mai 2029 (J+0)', description: 'Epandage de digestat à l\'enfouisseur - 20m3/ha' },
        { title: 'Binage x 2', date: '25 mai 2029 (J+15)', description: 'Binage et semis du trèfle à la volée avec le deuxième' }
      ]
    },
    {
      id: 4,
      name: 'Trèfle blanc',
      duration: '6 mois',
      dates: '1 juin 29 ➜ 15 nov. 29',
      color: '#d6d6d6',
      description: 'Semis à la volé lors du dernier binage du quinoa',
      details: {
        'Pré-semis': '',
        'Travail du sol': '',
        'Type de semoir': '',
        'Date des semis': ''
      },
      interventions: []
    },
    {
      id: 5,
      name: 'Blé + féverole',
      duration: '8 mois',
      dates: '15 nov. 29 ➜ 15 juil. 30',
      color: '#d2b48c',
      description: `Rendement blé : 36 qx/ha
Rendement féverole : 10 qx/ha

Semis du blé féverole en novembre en labour et combiné herse-semis avec une volonté d'implanter au moins 450grains m2 en blé`,
      interventions: [
        { title: 'Labour', date: '10 nov. 2029 (J-5)', description: '' },
        { title: 'Digestat liquide', date: '20 févr. 2030 (J+97)', description: 'Epandage de digestat liquide, 25m3/ha, février ou mars au pendillard, si possible au sans tonne.' },
        { title: 'Herse étrille', date: '15 mars 2030 (J+120)', description: '2 à 3 passage de herse étrille début de printemps, dont 1 fois en double passage rapprochés.' },
        { title: 'Herse étrille', date: '15 avr. 2030 (J+151)', description: '2 à 3 passage de herse étrille début de printemps, dont 1 fois en double passage rapprochés.' },
        { title: 'Moisson en mode fauchage andainage', date: '15 juil. 2030 (J+242)', description: 'Moisson en mode fauchage andainage et caisson de récupération de menue paille sur la moissonneuse, la paille est utilisé pour les animaux' }
      ],
      highlighted: true
    },
    {
      id: 6,
      name: 'Colza + sarrasin',
      duration: '10 mois',
      dates: '15 août 30 ➜ 15 juin 31',
      color: '#ffd700',
      description: `Rendement colza : 31 qx/ha

Semis associé avec du colza (1,5kg) + sarazin (12kg/ha) et repousse de feverole du précédent 
Fauchage du colza vers le 15 juin et récolte 10jours plus tard (30 qtx / ha → huile et tourteaux).`,
      details: {
        'Préparation du sol': 'Rouleau, combiné de semis, rouleau',
        'Rendements': 'Dans les 30 qtx / ha → huile et tourteaux'
      },
      interventions: [
        { title: 'Déchaumage', date: '10 août 2030 (J-5)', description: '' },
        { title: 'Epandage digestat', date: '15 août 2030 (J+0)', description: 'Epandage digestat solide et liquide' },
        { title: 'Labour', date: '15 août 2030 (J+0)', description: '' },
        { title: 'Fauchage andainage', date: '15 juin 2031 (J+304)', description: 'Fauchage du colza vers le 15 juin et récolte 10jours plus tard' }
      ]
    },
    {
      id: 7,
      name: 'Ray-grass italien + trèfle',
      duration: '10 mois',
      dates: '15 juin 31 ➜ 15 avr. 32',
      color: '#4caf50',
      description: 'Semis rapide de RGI/Trèfle (avec repousses de colza) 2 broyages sur fin été et automne pour apporter de la matière verte au sol',
      interventions: [
        { title: 'Broyages x 2', date: '30 août 2031 (J+76)', description: '2 broyages sur fin été et automne pour apporter de la matière verte au sol' },
        { title: 'Enrubannage', date: '1 avr. 2032 (J+291)', description: 'Enrubannage de la dérobé RGI/trèfle début avril' }
      ]
    },
    {
      id: 8,
      name: 'Maïs',
      duration: '4 mois',
      dates: '10 mai 32 ➜ 15 sept. 32',
      color: '#ffd700',
      description: `Rendement : 65 qx/ha

Epandage digestat liquide 35m3/ha à l'enfouisseur, labour et semis maïs au combiné en 50cm vers le 10 mai.

Normalement un mois après le semis, en 50cm l'interrang est recouvert.`,
      details: {
        'Récolte': 'Récolte en maïs épis pour des éleveur Bio, en octobre pour laisser la matière organique au sol.'
      },
      interventions: [
        { title: 'Digestat liquide', date: '5 mai 2032 (J-5)', description: 'Epandage digestat liquide 35m³/ha à l\'enfouisseur' },
        { title: 'Labour', date: '10 mai 2032 (J+0)', description: '' },
        { title: 'Herse étrille', date: '15 mai 2032 (J+5)', description: '' },
        { title: 'Houe rotative', date: '24 mai 2032 (J+14)', description: 'Houe rotative 7 à 10 jours après la herse étrille' },
        { title: 'Binage', date: '31 mai 2032 (J+21)', description: '' },
        { title: 'Binage', date: '7 juin 2032 (J+28)', description: '' }
      ]
    },
    {
      id: 9,
      name: 'Phacélie',
      duration: '8 mois',
      dates: '15 sept. 32 ➜ 15 mai 33',
      color: '#a7c6ed',
      description: 'Semis rapide d\'un couvert de phacélie à 10/12kg/ha',
      interventions: []
    }
  ];

  return (
    <div id="itk" className="w-full">
      <div className="grid grid-cols-1 gap-4">
        {rotationSteps.map((step) => (
          <div
            key={step.id}
            className={`rotation_item text-start border-l-4 rounded-lg bg-white shadow-sm ${step.highlighted ? 'ring-2 ring-blue-400' : ''}`}
            style={{ borderColor: step.color }}
          >
            <div className="step-header p-4 cursor-pointer" onClick={() => toggleStep(step.id)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ChevronDown
                      className={`size-4 transition-transform ${expandedSteps.has(step.id) ? '' : '-rotate-90'}`}
                    />
                    <div className="text-sm text-gray-600">
                      <b>{step.duration}</b> ({step.dates})
                    </div>
                  </div>
                  <h4 className="flex items-center gap-2">
                    {step.name}
                  </h4>
                </div>
              </div>
            </div>

            {expandedSteps.has(step.id) && (
              <div className="px-4 pb-4">
                <p className="step_description mb-4 whitespace-pre-line text-sm text-gray-700">
                  {step.description}
                </p>

                {step.details && Object.keys(step.details).length > 0 && (
                  <div className="details mb-4">
                    <dl className="space-y-2">
                      {Object.entries(step.details).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-sm">{key}</dt>
                          <dd className="text-sm text-gray-600 ml-4">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {step.interventions.length > 0 && (
                  <div className="interventions">
                    <h5 className="mb-3">Interventions</h5>
                    <div className="space-y-2">
                      {step.interventions.map((intervention, idx) => (
                        <div key={idx} className="intervention bg-gray-50 rounded p-3">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="intervention_title">
                              {intervention.title}
                            </span>
                            <span className="intervention_date badge rounded-pill bg-blue-100 text-blue-800 px-2 py-1 text-xs whitespace-nowrap">
                              {intervention.date}
                            </span>
                          </div>
                          {intervention.description && (
                            <div className="intervention_description text-sm text-gray-600 mt-1">
                              {intervention.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
