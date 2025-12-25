import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Trash2, Copy, Plus, Upload, FileJson, Wheat } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { ItineraryCard } from '@/components/ItineraryCard';
import CheckBox from '@/components/imports/CheckBox';

interface Itinerary {
  id: string;
  name: string;
  farmer: string;
  exploitation: string;
  parcelle: string;
  ville: string;
  departement: string;
  dateModification: Date;
  margeBrute: number;
  eiq: number;
  nbAnnees: number;
  productions: string[];
  cahierDesCharges?: string;
  description: string;
  nbVariantes?: number;
}

interface ItineraryListProps {
  onNavigateToProject: (id: string) => void;
  onNavigateToWizard: () => void;
}

export function ItineraryList({ onNavigateToProject, onNavigateToWizard }: ItineraryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'marge' | 'eiq' | 'agriculteurs'>('date');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [farmerFilter, setFarmerFilter] = useState<string | null>(null);
  const [productionFilter, setProductionFilter] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeView, setActiveView] = useState<'my-systems' | 'explore'>('my-systems');

  // Sample data
  const [itineraries] = useState<Itinerary[]>([
    {
      id: '1',
      name: 'Rotation Bio 2027-2033',
      farmer: 'Jean Dupont',
      exploitation: 'EARL Dupont',
      parcelle: 'Parcelle Sud',
      ville: 'Toulouse',
      departement: '31',
      dateModification: new Date('2024-12-08'),
      margeBrute: 12450,
      eiq: 18,
      nbAnnees: 7,
      productions: ['Blé', 'Orge', 'Luzerne', 'Quinoa', 'Colza', 'Maïs'],
      cahierDesCharges: 'Bio',
      description:
        'Rotation agroécologique sur 7 ans avec cultures associées, digestat et réduction EIQ. Objectif : transition vers AB et amélioration des marges.',
      nbVariantes: 2
    },
    {
      id: '2',
      name: 'Système Grandes Cultures Conserv.',
      farmer: 'Marie Martin',
      exploitation: 'GAEC Martin',
      parcelle: 'Plateau Est',
      ville: 'Albi',
      departement: '81',
      dateModification: new Date('2024-12-05'),
      margeBrute: 9800,
      eiq: 22,
      nbAnnees: 5,
      productions: ['Blé', 'Colza', 'Orge'],
      cahierDesCharges: 'TCS',
      description:
        'Système de grandes cultures en agriculture de conservation avec couverts végétaux et désherbage mécanique.',
      nbVariantes: 1
    },
    {
      id: '3',
      name: 'Polyculture-Élevage Intégré',
      farmer: 'Pierre Legrand',
      exploitation: 'SCEA Legrand',
      parcelle: 'Vallée Ouest',
      ville: 'Castres',
      departement: '81',
      dateModification: new Date('2024-12-01'),
      margeBrute: 15200,
      eiq: 12,
      nbAnnees: 6,
      productions: ['Maïs', 'Luzerne', 'Prairie', 'Blé'],
      cahierDesCharges: 'HVE',
      description:
        'Système polyculture-élevage avec autonomie fourragère, valorisation des effluents et rotation longue.',
      nbVariantes: 3
    },
    {
      id: '4',
      name: 'Maraîchage Diversifié Bio',
      farmer: 'Sophie Bernard',
      exploitation: 'Les Jardins de Sophie',
      parcelle: 'Serre 1-5',
      ville: 'Montauban',
      departement: '82',
      dateModification: new Date('2024-11-28'),
      margeBrute: 28500,
      eiq: 0,
      nbAnnees: 3,
      productions: ['Luzerne'],
      cahierDesCharges: 'Bio',
      description:
        'Maraîchage bio diversifié en circuit court avec engrais verts et rotations courtes intensives.',
      nbVariantes: 2
    },
    {
      id: '5',
      name: 'Céréales + Légumineuses',
      farmer: 'Jean Dupont',
      exploitation: 'EARL Dupont',
      parcelle: 'Parcelle Nord',
      ville: 'Toulouse',
      departement: '31',
      dateModification: new Date('2024-11-25'),
      margeBrute: 8900,
      eiq: 20,
      nbAnnees: 4,
      productions: ['Blé', 'Orge', 'Luzerne'],
      cahierDesCharges: 'ACS',
      description:
        'Rotation céréales-légumineuses pour améliorer la fertilité des sols et réduire les intrants azotés.'
    },
    {
      id: '6',
      name: 'Tournesol-Blé Conventionnel',
      farmer: 'Marie Martin',
      exploitation: 'GAEC Martin',
      parcelle: 'Plateau Ouest',
      ville: 'Albi',
      departement: '81',
      dateModification: new Date('2024-11-22'),
      margeBrute: 10500,
      eiq: 45,
      nbAnnees: 2,
      productions: ['Tournesol', 'Blé'],
      description:
        'Rotation courte tournesol-blé en système conventionnel avec désherbage chimique et fertilisation minérale.'
    },
    {
      id: '7',
      name: 'Viticulture Raisonnée',
      farmer: 'Camille Dubois',
      exploitation: 'Domaine Dubois',
      parcelle: 'Coteau Sud',
      ville: 'Gaillac',
      departement: '81',
      dateModification: new Date('2024-11-20'),
      margeBrute: 22000,
      eiq: 28,
      nbAnnees: 1,
      productions: ['Vigne'],
      cahierDesCharges: 'HVE',
      description:
        'Viticulture raisonnée avec enherbement inter-rangs et réduction des intrants phytosanitaires.',
      nbVariantes: 1
    },
    {
      id: '8',
      name: 'Sorgho-Soja Irrigué',
      farmer: 'Sophie Bernard',
      exploitation: 'Les Jardins de Sophie',
      parcelle: 'Parcelle Irrigable',
      ville: 'Montauban',
      departement: '82',
      dateModification: new Date('2024-11-18'),
      margeBrute: 11200,
      eiq: 32,
      nbAnnees: 3,
      productions: ['Sorgho', 'Soja', 'Blé'],
      description:
        'Rotation avec cultures d\'été irriguées pour sécuriser les rendements en contexte de sécheresse.'
    },
    {
      id: '9',
      name: 'Arboriculture Fruitière Bio',
      farmer: 'Emma Fournier',
      exploitation: 'Verger du Soleil',
      parcelle: 'Verger Principal',
      ville: 'Cahors',
      departement: '46',
      dateModification: new Date('2024-11-15'),
      margeBrute: 35000,
      eiq: 0,
      nbAnnees: 1,
      productions: ['Pommes', 'Poires'],
      cahierDesCharges: 'Bio',
      description:
        'Arboriculture fruitière en agriculture biologique avec gestion des adventices par paillage et faune auxiliaire.'
    },
    {
      id: '10',
      name: 'Colza-Blé-Orge Classique',
      farmer: 'Jean Dupont',
      exploitation: 'EARL Dupont',
      parcelle: 'Parcelle Est',
      ville: 'Toulouse',
      departement: '31',
      dateModification: new Date('2024-11-12'),
      margeBrute: 9500,
      eiq: 48,
      nbAnnees: 3,
      productions: ['Colza', 'Blé', 'Orge'],
      description:
        'Rotation triennale classique en grandes cultures avec labour et protection phytosanitaire standard.'
    },
    {
      id: '11',
      name: 'Prairies Permanentes Extensives',
      farmer: 'Pierre Legrand',
      exploitation: 'SCEA Legrand',
      parcelle: 'Prairies Basses',
      ville: 'Castres',
      departement: '81',
      dateModification: new Date('2024-11-10'),
      margeBrute: 4500,
      eiq: 0,
      nbAnnees: 1,
      productions: ['Prairie'],
      cahierDesCharges: 'Bio',
      description:
        'Prairies permanentes extensives pour l\'élevage bovin avec zéro intrant et biodiversité préservée.'
    },
    {
      id: '12',
      name: 'Pois-Blé-Tournesol',
      farmer: 'Alexandre Mercier',
      exploitation: 'GAEC Mercier',
      parcelle: 'Secteur Est',
      ville: 'Narbonne',
      departement: '11',
      dateModification: new Date('2024-11-08'),
      margeBrute: 10800,
      eiq: 25,
      nbAnnees: 3,
      productions: ['Pois', 'Blé', 'Tournesol'],
      cahierDesCharges: 'HVE',
      description:
        'Rotation avec protéagineux pour fixation azotée et amélioration de la structure du sol.'
    },
    {
      id: '13',
      name: 'Maïs Semence Irrigué',
      farmer: 'Pierre Legrand',
      exploitation: 'SCEA Legrand',
      parcelle: 'Parcelle Irriguée',
      ville: 'Castres',
      departement: '81',
      dateModification: new Date('2024-11-05'),
      margeBrute: 18500,
      eiq: 38,
      nbAnnees: 2,
      productions: ['Maïs', 'Blé'],
      description:
        'Production de maïs semence sous contrat avec irrigation pilotée et fertilisation raisonnée.'
    },
    {
      id: '14',
      name: 'Féverole-Triticale Bio',
      farmer: 'Claire Lambert',
      exploitation: 'Les Terres de Claire',
      parcelle: 'Parcelle Bio 2',
      ville: 'Carcassonne',
      departement: '11',
      dateModification: new Date('2024-11-03'),
      margeBrute: 7800,
      eiq: 0,
      nbAnnees: 4,
      productions: ['Féverole', 'Triticale', 'Luzerne', 'Blé'],
      cahierDesCharges: 'Bio',
      description:
        'Rotation bio avec légumineuses à graines et fourragères pour autonomie protéique et fertilité.'
    },
    {
      id: '15',
      name: 'Cultures Méditerranéennes',
      farmer: 'Marc Durand',
      exploitation: 'SCEA Durand Sud',
      parcelle: 'Terrasses',
      ville: 'Perpignan',
      departement: '66',
      dateModification: new Date('2024-11-01'),
      margeBrute: 13500,
      eiq: 30,
      nbAnnees: 3,
      productions: ['Melon', 'Salade', 'Tomate'],
      description:
        'Cultures maraîchères méditerranéennes en plein champ avec paillage plastique et irrigation goutte-à-goutte.'
    },
    {
      id: '16',
      name: 'Blé Dur-Pois Chiche',
      farmer: 'Sophie Bernard',
      exploitation: 'Les Jardins de Sophie',
      parcelle: 'Plaine Sèche',
      ville: 'Montauban',
      departement: '82',
      dateModification: new Date('2024-10-28'),
      margeBrute: 8200,
      eiq: 24,
      nbAnnees: 2,
      productions: ['Blé dur', 'Pois chiche'],
      cahierDesCharges: 'ACS',
      description:
        'Rotation adaptée au climat méditerranéen sec avec cultures résistantes à la sécheresse.'
    },
    {
      id: '17',
      name: 'Agroforesterie Noyers-Céréales',
      farmer: 'Vincent Leroy',
      exploitation: 'Domaine Leroy',
      parcelle: 'Parcelle Agroforestière',
      ville: 'Périgueux',
      departement: '24',
      dateModification: new Date('2024-10-25'),
      margeBrute: 14500,
      eiq: 15,
      nbAnnees: 5,
      productions: ['Noix', 'Blé', 'Orge'],
      cahierDesCharges: 'HVE',
      description:
        'Système agroforestier associant noyers et grandes cultures avec amélioration de la biodiversité.'
    },
    {
      id: '18',
      name: 'Lin-Blé-Colza',
      farmer: 'Pauline Michel',
      exploitation: 'EARL Michel',
      parcelle: 'Grande Parcelle',
      ville: 'Pau',
      departement: '64',
      dateModification: new Date('2024-10-22'),
      margeBrute: 11800,
      eiq: 40,
      nbAnnees: 3,
      productions: ['Lin', 'Blé', 'Colza'],
      cahierDesCharges: 'TCS',
      description:
        'Rotation incluant culture de lin fibre sous contrat avec désherbage mécanique et chimique combiné.'
    }
  ]);

  // Data for "Explorer d'autres systèmes" view
  const [exploreItineraries] = useState<Itinerary[]>([
    {
      id: 'e1',
      name: 'Rotation Longue 8 ans AB',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'Exploitation AB',
      parcelle: 'Parcelle principale',
      ville: 'Rodez',
      departement: '12',
      dateModification: new Date('2024-12-10'),
      margeBrute: 16800,
      eiq: 0,
      nbAnnees: 8,
      productions: ['Blé', 'Épeautre', 'Lentilles', 'Luzerne', 'Sarrasin'],
      cahierDesCharges: 'Bio',
      description:
        'Rotation longue en agriculture biologique avec diversification maximale. Intégration de légumineuses à graines et fourragères pour autonomie azotée complète.'
    },
    {
      id: 'e2',
      name: 'Céréales-Protéagineux Bas Intrants',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'Exploitation Raisonnée',
      parcelle: 'Secteur Nord',
      ville: 'Agen',
      departement: '47',
      dateModification: new Date('2024-12-07'),
      margeBrute: 11200,
      eiq: 16,
      nbAnnees: 4,
      productions: ['Blé', 'Pois', 'Féverole', 'Orge'],
      cahierDesCharges: 'HVE',
      description:
        'Système céréalier à bas niveau d\'intrants avec introduction de protéagineux. Réduction de 60% des phytosanitaires vs référence régionale.'
    },
    {
      id: 'e3',
      name: 'Maraîchage Sol Vivant',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'Ferme Maraîchère',
      parcelle: 'Tunnel 1-8',
      ville: 'Avignon',
      departement: '84',
      dateModification: new Date('2024-12-06'),
      margeBrute: 42000,
      eiq: 0,
      nbAnnees: 2,
      productions: ['Tomate', 'Salade', 'Courgette', 'Aubergine'],
      cahierDesCharges: 'Bio',
      description:
        'Maraîchage sur sol vivant sans travail du sol. Paillage permanent, couverts végétaux et compostage de surface pour fertilité biologique optimale.'
    },
    {
      id: 'e4',
      name: 'Vigne HVE Agroécologique',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'Domaine Viticole',
      parcelle: 'Coteaux Sud',
      ville: 'Bordeaux',
      departement: '33',
      dateModification: new Date('2024-12-04'),
      margeBrute: 28000,
      eiq: 20,
      nbAnnees: 1,
      productions: ['Vigne'],
      cahierDesCharges: 'HVE',
      description:
        'Viticulture HVE niveau 3 avec enherbement permanent, haies, nichoirs et réduction maximale des intrants. Certification en cours vers bio.'
    },
    {
      id: 'e5',
      name: 'Élevage Laitier Herbager',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'GAEC Laitier',
      parcelle: 'Prairies permanentes',
      ville: 'Aurillac',
      departement: '15',
      dateModification: new Date('2024-12-02'),
      margeBrute: 19500,
      eiq: 0,
      nbAnnees: 1,
      productions: ['Prairie'],
      cahierDesCharges: 'Bio',
      description:
        'Système herbager pâturant avec 95% d\'herbe dans la ration. Autonomie fourragère et protéique totale, valorisation optimale des prairies permanentes.'
    },
    {
      id: 'e6',
      name: 'Système Agrivoltaïque Ovin',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'Ferme Ovine',
      parcelle: 'Zone panneaux solaires',
      ville: 'Béziers',
      departement: '34',
      dateModification: new Date('2024-11-30'),
      margeBrute: 8900,
      eiq: 0,
      nbAnnees: 1,
      productions: ['Prairie'],
      cahierDesCharges: 'HVE',
      description:
        'Élevage ovin sous panneaux photovoltaïques. Double valorisation énergétique et agricole, amélioration du bien-être animal par ombrage estival.'
    },
    {
      id: 'e7',
      name: 'Permaculture Maraîchère',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'Jardin Permacole',
      parcelle: 'Zone intensive',
      ville: 'Angers',
      departement: '49',
      dateModification: new Date('2024-11-27'),
      margeBrute: 52000,
      eiq: 0,
      nbAnnees: 1,
      productions: ['Salade', 'Tomate', 'Luzerne'],
      cahierDesCharges: 'Bio',
      description:
        'Maraîchage diversifié sur petite surface en permaculture. 40 espèces cultivées, zéro mécanisation, micro-ferme sur 2000m² avec haute valeur ajoutée.'
    },
    {
      id: 'e8',
      name: 'Chanvre Industriel Bio',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'EARL Chanvre',
      parcelle: 'Grande parcelle',
      ville: 'Troyes',
      departement: '10',
      dateModification: new Date('2024-11-24'),
      margeBrute: 13800,
      eiq: 0,
      nbAnnees: 3,
      productions: ['Chanvre', 'Blé', 'Luzerne'],
      cahierDesCharges: 'Bio',
      description:
        'Culture de chanvre industriel en rotation avec céréales bio. Plante nettoyante, structurante et valorisation en écoconstruction et alimentation.'
    },
    {
      id: 'e9',
      name: 'Houblon-Céréales Spécialisé',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'Ferme Houblon',
      parcelle: 'Parcelle palissée',
      ville: 'Strasbourg',
      departement: '67',
      dateModification: new Date('2024-11-21'),
      margeBrute: 24500,
      eiq: 34,
      nbAnnees: 4,
      productions: ['Houblon', 'Orge', 'Blé'],
      description:
        'Production de houblon artisanal en rotation avec orge brassicole. Filière courte brasserie locale, valorisation premium des productions.'
    },
    {
      id: 'e10',
      name: 'Grandes Cultures Conservation',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'GAEC Conservationniste',
      parcelle: 'Plateau calcaire',
      ville: 'Châteauroux',
      departement: '36',
      dateModification: new Date('2024-11-19'),
      margeBrute: 10900,
      eiq: 18,
      nbAnnees: 6,
      productions: ['Blé', 'Colza', 'Orge', 'Tournesol'],
      cahierDesCharges: 'ACS',
      description:
        'Agriculture de conservation des sols avec semis direct permanent. Couverts multi-espèces systématiques, réduction travail du sol de 100%.'
    },
    {
      id: 'e11',
      name: 'PPAM Plantes Aromatiques Bio',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'Ferme PPAM',
      parcelle: 'Terrasses Sud',
      ville: 'Digne-les-Bains',
      departement: '04',
      dateModification: new Date('2024-11-16'),
      margeBrute: 31000,
      eiq: 0,
      nbAnnees: 3,
      productions: ['Lavande', 'Thym', 'Romarin'],
      cahierDesCharges: 'Bio',
      description:
        'Production de plantes à parfum, aromatiques et médicinales en agriculture biologique. Valorisation directe en huiles essentielles et vente circuits courts.'
    },
    {
      id: 'e12',
      name: 'Sarrasin-Millet Anciennes Variétés',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'EARL Terroir',
      parcelle: 'Zone sèche',
      ville: 'Le Puy-en-Velay',
      departement: '43',
      dateModification: new Date('2024-11-13'),
      margeBrute: 9200,
      eiq: 8,
      nbAnnees: 3,
      productions: ['Sarrasin', 'Millet', 'Lentilles'],
      cahierDesCharges: 'HVE',
      description:
        'Cultures anciennes adaptées aux terres pauvres et sèches. Valorisation AOP/IGP locale, autonomie semencière avec variétés paysannes.'
    },
    {
      id: 'e13',
      name: 'Verger Haute-Tige Cidricole',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'Cidrerie Fermière',
      parcelle: 'Verger traditionnel',
      ville: 'Caen',
      departement: '14',
      dateModification: new Date('2024-11-11'),
      margeBrute: 18700,
      eiq: 10,
      nbAnnees: 1,
      productions: ['Pommes'],
      cahierDesCharges: 'HVE',
      description:
        'Verger haute-tige en agroforesterie avec pâturage ovin. Production cidricole artisanale AOP Calvados, haute biodiversité fonctionnelle.'
    },
    {
      id: 'e14',
      name: 'Riz Camarguais Biologique',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'Rizière Bio',
      parcelle: 'Casiers inondés',
      ville: 'Arles',
      departement: '13',
      dateModification: new Date('2024-11-09'),
      margeBrute: 14300,
      eiq: 0,
      nbAnnees: 3,
      productions: ['Riz', 'Blé dur'],
      cahierDesCharges: 'Bio',
      description:
        'Riziculture biologique camarguaise en rotation avec blé dur. Gestion hydraulique écologique favorable à l\'avifaune et à la biodiversité des zones humides.'
    },
    {
      id: 'e15',
      name: 'Kiwi-Noyers Système Mixte',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'Verger Mixte',
      parcelle: 'Parcelle diversifiée',
      ville: 'Agen',
      departement: '47',
      dateModification: new Date('2024-11-06'),
      margeBrute: 26400,
      eiq: 24,
      nbAnnees: 1,
      productions: ['Kiwi', 'Noix'],
      cahierDesCharges: 'HVE',
      description:
        'Association fruitière kiwi-noyers pour optimisation foncière. Double récolte automnale, complémentarité des cycles et des besoins en eau.'
    },
    {
      id: 'e16',
      name: 'Colza-Tournesol HVE Oléagineux',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'SCEA Oléagineuse',
      parcelle: 'Parcelle Nord-Est',
      ville: 'Niort',
      departement: '79',
      dateModification: new Date('2024-11-04'),
      margeBrute: 11600,
      eiq: 30,
      nbAnnees: 4,
      productions: ['Colza', 'Tournesol', 'Blé', 'Orge'],
      cahierDesCharges: 'HVE',
      description:
        'Rotation oléagineuse certifiée HVE avec désherbage mécanique combiné. Bandes fleuries, haies et couverts systématiques pour biodiversité fonctionnelle.'
    },
    {
      id: 'e17',
      name: 'Élevage Caprin Fromager Bio',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'Chèvrerie Bio',
      parcelle: 'Parcours et prairies',
      ville: 'Poitiers',
      departement: '86',
      dateModification: new Date('2024-11-02'),
      margeBrute: 21300,
      eiq: 0,
      nbAnnees: 5,
      productions: ['Prairie', 'Luzerne', 'Maïs'],
      cahierDesCharges: 'Bio',
      description:
        'Élevage caprin fromager bio en autonomie fourragère. Transformation fermière AOP, pâturage tournant dynamique et séchage en grange du foin.'
    },
    {
      id: 'e18',
      name: 'Safran-Maraîchage Haute Valeur',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'Micro-ferme Safran',
      parcelle: 'Parcelle intensive',
      ville: 'Clermont-Ferrand',
      departement: '63',
      dateModification: new Date('2024-10-30'),
      margeBrute: 38500,
      eiq: 0,
      nbAnnees: 2,
      productions: ['Safran', 'Salade', 'Tomate'],
      cahierDesCharges: 'Bio',
      description:
        'Production de safran associée au maraîchage bio diversifié. Épice à très haute valeur ajoutée, vente directe et transformation artisanale (confitures safranées).'
    },
    {
      id: 'e19',
      name: 'Trufficulture-Vignoble',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'Domaine Trufficole',
      parcelle: 'Coteaux calcaires',
      ville: 'Cahors',
      departement: '46',
      dateModification: new Date('2024-10-26'),
      margeBrute: 32500,
      eiq: 18,
      nbAnnees: 1,
      productions: ['Vigne', 'Truffes'],
      cahierDesCharges: 'TCS',
      description:
        'Association trufficulture et viticulture sur terroir calcaire. Chênes truffiers en inter-rangs de vigne, double valorisation patrimoniale et économique.'
    },
    {
      id: 'e20',
      name: 'Seigle-Triticale Semences Paysannes',
      farmer: 'Agriculteur Anonyme',
      exploitation: 'EARL Semences',
      parcelle: 'Parcelle isolée',
      ville: 'Guéret',
      departement: '23',
      dateModification: new Date('2024-10-23'),
      margeBrute: 7600,
      eiq: 0,
      nbAnnees: 4,
      productions: ['Seigle', 'Triticale', 'Épeautre', 'Luzerne'],
      cahierDesCharges: 'Bio',
      description:
        'Production de semences paysannes de céréales rustiques. Sélection participative, multiplication en isolement, vente réseau agriculteurs bio.'
    }
  ]);

  // Filtered and sorted itineraries
  const filteredItineraries = useMemo(() => {
    // Use different data source based on active view
    const sourceData = activeView === 'explore' ? exploreItineraries : itineraries;
    let result = [...sourceData];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (it) =>
          it.name.toLowerCase().includes(query) ||
          it.farmer.toLowerCase().includes(query) ||
          it.ville.toLowerCase().includes(query) ||
          it.description.toLowerCase().includes(query) ||
          it.productions.some((p) => p.toLowerCase().includes(query))
      );
    }

    // Farmer filter
    if (farmerFilter) {
      result = result.filter((it) => it.farmer === farmerFilter);
    }

    // Production filter
    if (productionFilter) {
      result = result.filter((it) => it.productions.includes(productionFilter));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return b.dateModification.getTime() - a.dateModification.getTime();
      } else if (sortBy === 'marge') {
        return b.margeBrute - a.margeBrute;
      } else if (sortBy === 'eiq') {
        return a.eiq - b.eiq;
      } else {
        return a.farmer.localeCompare(b.farmer);
      }
    });

    return result;
  }, [itineraries, exploreItineraries, activeView, searchQuery, sortBy, farmerFilter, productionFilter]);

  // Group by farmer when agriculteurs sort is selected
  const groupedByFarmer = useMemo(() => {
    const groups: { [farmer: string]: Itinerary[] } = {};
    filteredItineraries.forEach((itinerary) => {
      if (!groups[itinerary.farmer]) {
        groups[itinerary.farmer] = [];
      }
      groups[itinerary.farmer].push(itinerary);
    });
    return groups;
  }, [filteredItineraries]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDelete = () => {
    if (confirm(`Supprimer ${selectedIds.size} système${selectedIds.size > 1 ? 's' : ''} de cultures ?`)) {
      // Delete logic here
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
  };

  const handleDuplicate = () => {
    // Duplicate logic here
    alert(`Dupliquer ${selectedIds.size} système${selectedIds.size > 1 ? 's' : ''} de cultures`);
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const clearFarmerFilter = () => setFarmerFilter(null);
  const clearProductionFilter = () => setProductionFilter(null);

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <TopBar
        variant="list"
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <main className="px-6 py-6">
        {/* Page Title and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="mb-2">
              {activeView === 'my-systems' ? 'Liste des systèmes' : 'Explorer d\'autres systèmes'}
            </h1>
            <p className="text-gray-600">
              {filteredItineraries.length} système{filteredItineraries.length > 1 ? 's' : ''} de cultures
              {farmerFilter && ` • Agriculteur: ${farmerFilter}`}
              {productionFilter && ` • Production: ${productionFilter}`}
            </p>
          </div>
          <div className="flex gap-3">
            {activeView === 'my-systems' && (
              <>
                <button
                  onClick={() => {
                    setSelectionMode(!selectionMode);
                    setSelectedIds(new Set());
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    selectionMode
                      ? 'bg-[#6b9571] text-white border-[#6b9571]'
                      : 'bg-white border-gray-300 hover:border-[#6b9571]'
                  }`}
                >
                  <div className="size-5" style={{ '--fill-0': selectionMode ? '#ffffff' : '#707070' } as React.CSSProperties}>
                    <CheckBox />
                  </div>
                  Sélectionner
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#6b9571] text-white rounded-lg hover:bg-[#5a8560] transition-colors"
                >
                  <Plus className="size-5" />
                  Nouveau système de cultures
                </button>
              </>
            )}
          </div>
        </div>

        {/* Action buttons when items are selected */}
        {selectionMode && selectedIds.size > 0 && (
          <div className="bg-[#6b9571] text-white rounded-lg p-4 mb-6 flex items-center justify-between">
            <span>
              {selectedIds.size} système{selectedIds.size > 1 ? 's' : ''} de cultures sélectionné{selectedIds.size > 1 ? 's' : ''}
            </span>
            <div className="flex gap-3">
              <button
                onClick={handleDuplicate}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#6b9571] rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Copy className="size-5" />
                Dupliquer
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="size-5" />
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un système de cultures, agriculteur, ville, production..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#6b9571] focus:border-transparent"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-gray-700 whitespace-nowrap">
                Trié par :
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-4 pr-12 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6b9571] focus:border-transparent cursor-pointer p-[8px] mt-[0px] mr-[9px] mb-[0px] ml-[0px]"
              >
                <option value="date">Date</option>
                <option value="marge">Marge</option>
                <option value="eiq">EIQ</option>
                <option value="agriculteurs">Agriculteurs</option>
              </select>
            </div>
          </div>

          {/* Active filters */}
          {(farmerFilter || productionFilter) && (
            <div className="flex gap-2 mt-4">
              {farmerFilter && (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#6b9571] text-white rounded-full text-sm">
                  <span>Agriculteur: {farmerFilter}</span>
                  <button onClick={clearFarmerFilter} className="hover:text-gray-200">
                    ✕
                  </button>
                </div>
              )}
              {productionFilter && (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#6b9571] text-white rounded-full text-sm">
                  <span>Production: {productionFilter}</span>
                  <button onClick={clearProductionFilter} className="hover:text-gray-200">
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Itineraries Grid */}
        {sortBy === 'agriculteurs' ? (
          // Grouped by farmer view
          <div className="space-y-8">
            {Object.keys(groupedByFarmer).sort().map((farmer) => {
              const farmerItineraries = groupedByFarmer[farmer];
              const farmerExploitation = farmerItineraries[0]?.exploitation || '';

              return (
                <div key={farmer} className="space-y-4">
                  {/* Farmer header */}
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-[#6b9571]">
                    <div className="size-10 rounded-full bg-[#6b9571] flex items-center justify-center text-white">
                      {farmer.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h2 className="text-[#6b9571]">{farmer}</h2>
                      <p className="text-sm text-gray-600">{farmerExploitation} • {farmerItineraries.length} système{farmerItineraries.length > 1 ? 's' : ''} de cultures</p>
                    </div>
                  </div>

                  {/* Farmer's itineraries */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {farmerItineraries.map((itinerary) => (
                      <ItineraryCard
                        key={itinerary.id}
                        {...itinerary}
                        isSelected={selectedIds.has(itinerary.id)}
                        onSelect={toggleSelection}
                        onNavigate={onNavigateToProject}
                        onFilterByFarmer={setFarmerFilter}
                        onFilterByProduction={setProductionFilter}
                        selectionMode={selectionMode}
                        anonymized={activeView === 'explore'}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Normal grid view
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredItineraries.map((itinerary) => (
              <ItineraryCard
                key={itinerary.id}
                {...itinerary}
                isSelected={selectedIds.has(itinerary.id)}
                onSelect={toggleSelection}
                onNavigate={onNavigateToProject}
                onFilterByFarmer={setFarmerFilter}
                onFilterByProduction={setProductionFilter}
                selectionMode={selectionMode}
                anonymized={activeView === 'explore'}
              />
            ))}
          </div>
        )}

        {filteredItineraries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Aucun système de cultures trouvé</p>
          </div>
        )}
      </main>

      {/* Create Itinerary Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-gray-900 mb-6">Créer un nouveau système de cultures</h2>

              <div className="space-y-3">
                {/* Option 1: Créer depuis zéro */}
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    onNavigateToWizard();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-[#6b9571] text-white rounded-lg hover:bg-[#5a8560] transition-colors"
                >
                  <Plus className="size-5" />
                  <span>Créer un nouveau système de cultures</span>
                </button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-sm text-gray-500">ou importer depuis</span>
                  </div>
                </div>

                {/* Option 2: Importer JSON */}
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    alert('Import JSON - Fonctionnalité à implémenter');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#6b9571] hover:bg-gray-50 transition-colors"
                >
                  <FileJson className="size-5" />
                  <span>Importer un système de cultures (JSON)</span>
                </button>

                {/* Option 3: Geofolia */}
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    alert('Import Geofolia - Fonctionnalité à implémenter');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#6b9571] hover:bg-gray-50 transition-colors"
                >
                  <Wheat className="size-5" />
                  <span>Geofolia</span>
                </button>

                {/* Option 4: Mes Parcels */}
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    alert('Import Mes Parcels - Fonctionnalité à implémenter');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#6b9571] hover:bg-gray-50 transition-colors"
                >
                  <Wheat className="size-5" />
                  <span>Mes Parcels</span>
                </button>
              </div>

              {/* Bouton Annuler */}
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}