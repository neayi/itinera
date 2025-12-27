import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FolderOpen, Download, Trash2, Settings, ChevronsRight, ChevronDown, Send, Sparkles } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { ContextPanel } from '@/components/ContextPanel';
import { InterventionsTable } from '@/components/InterventionsTable';
import { ChatBot } from '@/components/ChatBot';
import { InterventionData, RotationData } from '@/lib/types';
import rotationImage from '/assets/27306e63853312b0a5409dab31e623a342b89acd.png';
import rotationImageVariante from '/assets/76a8820b2bbb143b9408e1bff60e1c3c5aabf95c.png';
import { variant1Interventions } from '@/lib/data/variant1Interventions';
import { ItineraireTechnique } from '@/components/ItineraireTechnique';

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
  variant?: string;
}

export function ProjectDetails({ projectId, onBack, variant = 'Originale' }: ProjectDetailsProps) {
  // Project configuration
  const projectSurface = 15; // hectares
  const rotationStartYear = 2027;
  const rotationEndYear = 2033;

  // Stocker les données originales en tant que constante
  const originaleInterventionsData: InterventionData[] = [
    // 1 - Orge + Lupin
    {
      id: '1',
      ordre: 1,
      category: '1 - Orge + Lupin',
      name: 'Labour',
      description: 'Labour profond 25cm',
      produit: '',
      date: new Date('2027-09-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 85,
      irrigation: 0,
      workTime: 2.5,
      gnr: 28,
      ges: 73.6,
      charges: 85,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '2',
      ordre: 2,
      category: '1 - Orge + Lupin',
      name: 'Semis orge + lupin',
      description: 'Semis associé orge 120kg/ha + lupin 40kg/ha',
      produit: 'Orge brassicole + Lupin blanc',
      date: new Date('2027-10-05'),
      semences: 185,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 45,
      irrigation: 0,
      workTime: 1.8,
      gnr: 12,
      ges: 31.2,
      charges: 230,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '3',
      ordre: 3,
      category: '1 - Orge + Lupin',
      name: 'Digestat solide',
      description: 'Epandage de digestat solide 7T/ha en février',
      produit: 'Digestat solide',
      date: new Date('2028-02-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 49,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 35,
      irrigation: 0,
      workTime: 1.5,
      gnr: 15,
      ges: 39,
      charges: 95,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '4',
      ordre: 4,
      category: '1 - Orge + Lupin',
      name: 'Désherbage mécanique',
      description: 'Herse étrille',
      produit: '',
      date: new Date('2028-03-10'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 25,
      irrigation: 0,
      workTime: 1.2,
      gnr: 8,
      ges: 20.8,
      charges: 25,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '5',
      ordre: 5,
      category: '1 - Orge + Lupin',
      name: 'Récolte',
      description: 'Fauche, andainage puis récolte avec broyage des pailles',
      produit: '',
      date: new Date('2028-07-10'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 180,
      irrigation: 0,
      workTime: 3.2,
      gnr: 45,
      ges: 117,
      charges: 180,
      margeBrute: 1250,
      expanded: false
    },

    // 2 - Luzerne + trèfle violet et blanc
    {
      id: '6',
      ordre: 6,
      category: '2 - Luzerne + trèfle violet et blanc',
      name: 'Destruction au combiné',
      description: "Destruction au combiné au moment d'implanter la CIVE",
      produit: '',
      date: new Date('2028-08-01'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 95,
      irrigation: 0,
      workTime: 2.0,
      gnr: 32,
      ges: 83.2,
      charges: 95,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '7',
      ordre: 7,
      category: '2 - Luzerne + trèfle violet et blanc',
      name: 'Digestat liquide',
      description: 'Epandage de digestat 20m³/ha',
      produit: 'Digestat liquide',
      date: new Date('2028-09-10'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 80,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 40,
      irrigation: 0,
      workTime: 1.3,
      gnr: 18,
      ges: 46.8,
      charges: 110,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '8',
      ordre: 8,
      category: '2 - Luzerne + trèfle violet et blanc',
      name: 'Engrais potassique',
      description: 'Epandage de 200kg/ha de chlorure de potassium',
      produit: 'Chlorure de potassium (KCl 60%)',
      date: new Date('2028-10-05'),
      semences: 0,
      engrais: 120,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 30,
      irrigation: 0,
      workTime: 0.8,
      gnr: 10,
      ges: 26,
      charges: 150,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '9',
      ordre: 9,
      category: '2 - Luzerne + trèfle violet et blanc',
      name: 'Semis associé luzerne',
      description: 'Semis associé de la luzerne à la volée 20kg/ha',
      produit: 'Luzerne + Trèfle violet + Trèfle blanc',
      date: new Date('2028-10-20'),
      semences: 140,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 50,
      irrigation: 0,
      workTime: 2.2,
      gnr: 14,
      ges: 36.4,
      charges: 190,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '10',
      ordre: 10,
      category: '2 - Luzerne + trèfle violet et blanc',
      name: 'Digestat liquide',
      description: 'Epandage de digestat 20m³/ha au printemps',
      produit: 'Digestat liquide',
      date: new Date('2029-03-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 80,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 40,
      irrigation: 0,
      workTime: 1.3,
      gnr: 18,
      ges: 46.8,
      charges: 110,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '11',
      ordre: 11,
      category: '2 - Luzerne + trèfle violet et blanc',
      name: 'Engrais potassique',
      description: 'Epandage de 200kg/ha de chlorure de potassium',
      produit: 'Chlorure de potassium (KCl 60%)',
      date: new Date('2029-04-10'),
      semences: 0,
      engrais: 120,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 30,
      irrigation: 0,
      workTime: 0.8,
      gnr: 10,
      ges: 26,
      charges: 150,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '12',
      ordre: 12,
      category: '2 - Luzerne + trèfle violet et blanc',
      name: 'Fauche et récolte',
      description: '3 coupes de luzerne',
      produit: '',
      date: new Date('2029-06-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 240,
      irrigation: 0,
      workTime: 4.5,
      gnr: 65,
      ges: 169,
      charges: 240,
      margeBrute: 1800,
      expanded: false
    },

    // 3 - CIVE (Triticale)
    {
      id: '13',
      ordre: 13,
      category: '3 - CIVE (Triticale)',
      name: 'Semis triticale',
      description: `Semis à 100kg/ha, au combiné :
* Cultivateur à l'avant
* A l'arrière, fissurateur à 15cm de profondeur
* Herse rotative
* Ligne de semis`,
      produit: 'Triticale fourrager',
      date: new Date('2028-11-05'),
      semences: 95,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 45,
      irrigation: 0,
      workTime: 1.5,
      gnr: 12,
      ges: 31.2,
      charges: 140,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '14',
      ordre: 14,
      category: '3 - CIVE (Triticale)',
      name: 'Digestat liquide',
      description: 'Epandage de digestat liquide, 20m³/ha en février',
      produit: 'Digestat liquide',
      date: new Date('2029-02-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 80,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 40,
      irrigation: 0,
      workTime: 1.4,
      gnr: 18,
      ges: 46.8,
      charges: 90,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '15',
      ordre: 15,
      category: '3 - CIVE (Triticale)',
      name: 'Ensilage',
      description: 'Récolte en ensilage',
      produit: '',
      date: new Date('2029-05-20'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 165,
      irrigation: 0,
      workTime: 4.2,
      gnr: 55,
      ges: 143,
      charges: 165,
      margeBrute: 450,
      expanded: false
    },

    // 4 - Quinoa
    {
      id: '16',
      ordre: 16,
      category: '4 - Quinoa',
      name: 'Labour',
      description: 'Labour 20cm',
      produit: '',
      date: new Date('2029-06-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 85,
      irrigation: 0,
      workTime: 2.5,
      gnr: 28,
      ges: 73.6,
      charges: 85,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '17',
      ordre: 17,
      category: '4 - Quinoa',
      name: 'Digestat liquide',
      description: "Epandage de digestat à l'enfouisseur - 20m3/ha",
      produit: 'Digestat liquide',
      date: new Date('2029-07-01'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 80,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 45,
      irrigation: 0,
      workTime: 1.4,
      gnr: 18,
      ges: 46.8,
      charges: 90,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '18',
      ordre: 18,
      category: '4 - Quinoa',
      name: 'Semis quinoa',
      description: 'Semis de quinoa 8kg/ha au semoir monograine',
      produit: 'Quinoa blanc',
      date: new Date('2029-07-15'),
      semences: 280,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 55,
      irrigation: 0,
      workTime: 1.8,
      gnr: 15,
      ges: 39,
      charges: 335,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '19',
      ordre: 19,
      category: '4 - Quinoa',
      name: 'Binage x 2',
      description: 'Binage et semis du trèfle à la volée avec le deuxième',
      produit: 'Trèfle blanc nain',
      date: new Date('2029-08-10'),
      semences: 25,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 70,
      irrigation: 0,
      workTime: 2.8,
      gnr: 18,
      ges: 46.8,
      charges: 95,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '20',
      ordre: 20,
      category: '4 - Quinoa',
      name: 'Irrigation x 3',
      description: 'Irrigation goutte à goutte 3 passages',
      produit: '',
      date: new Date('2029-08-25'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 0,
      irrigation: 180,
      workTime: 1.5,
      gnr: 0,
      ges: 15,
      charges: 180,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '21',
      ordre: 21,
      category: '4 - Quinoa',
      name: 'Récolte quinoa',
      description: 'Récolte à la moissonneuse',
      produit: '',
      date: new Date('2029-10-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 135,
      irrigation: 0,
      workTime: 2.8,
      gnr: 38,
      ges: 98.8,
      charges: 135,
      margeBrute: 3200,
      expanded: false
    },

    // 5 - Blé + féverole
    {
      id: '22',
      ordre: 22,
      category: '5 - Blé + féverole',
      name: 'Déchaumage',
      description: 'Déchaumage superficiel',
      produit: '',
      date: new Date('2029-11-01'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 35,
      irrigation: 0,
      workTime: 1.2,
      gnr: 12,
      ges: 31.2,
      charges: 35,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '23',
      ordre: 23,
      category: '5 - Blé + féverole',
      name: 'Semis blé + féverole',
      description: 'Semis associé blé 150kg/ha + féverole 50kg/ha',
      produit: 'Blé tendre + Féverole',
      date: new Date('2029-11-15'),
      semences: 195,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 50,
      irrigation: 0,
      workTime: 2.0,
      gnr: 14,
      ges: 36.4,
      charges: 245,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '24',
      ordre: 24,
      category: '5 - Blé + féverole',
      name: 'Digestat liquide',
      description: 'Epandage de digestat 25m³/ha',
      produit: 'Digestat liquide',
      date: new Date('2030-02-20'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 100,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 45,
      irrigation: 0,
      workTime: 1.5,
      gnr: 20,
      ges: 52,
      charges: 115,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '25',
      ordre: 25,
      category: '5 - Blé + féverole',
      name: 'Désherbage mécanique',
      description: 'Herse étrille',
      produit: '',
      date: new Date('2030-03-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 25,
      irrigation: 0,
      workTime: 1.2,
      gnr: 8,
      ges: 20.8,
      charges: 25,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '26',
      ordre: 26,
      category: '5 - Blé + féverole',
      name: 'Traitement fongicide',
      description: 'Traitement fongicide dernière feuille',
      produit: 'Fongicide systémique (triazole)',
      date: new Date('2030-05-10'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 45,
      eiq: 25,
      mecanisation: 30,
      irrigation: 0,
      workTime: 1.0,
      gnr: 8,
      ges: 20.8,
      charges: 75,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '27',
      ordre: 27,
      category: '5 - Blé + féverole',
      name: 'Récolte',
      description: 'Moisson avec broyage des pailles',
      produit: '',
      date: new Date('2030-07-25'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 165,
      irrigation: 0,
      workTime: 3.0,
      gnr: 42,
      ges: 109.2,
      charges: 165,
      margeBrute: 1450,
      expanded: false
    },

    // 6 - Colza + sarrasin
    {
      id: '28',
      ordre: 28,
      category: '6 - Colza + sarrasin',
      name: 'Déchaumage x 2',
      description: 'Double déchaumage pour détruire les repousses',
      produit: '',
      date: new Date('2030-08-05'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 55,
      irrigation: 0,
      workTime: 2.0,
      gnr: 20,
      ges: 52,
      charges: 55,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '29',
      ordre: 29,
      category: '6 - Colza + sarrasin',
      name: 'Semis colza associé',
      description: 'Semis colza 3kg/ha + sarrasin 10kg/ha',
      produit: 'Colza + Sarrasin',
      date: new Date('2030-08-25'),
      semences: 165,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 50,
      irrigation: 0,
      workTime: 1.8,
      gnr: 14,
      ges: 36.4,
      charges: 215,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '30',
      ordre: 30,
      category: '6 - Colza + sarrasin',
      name: 'Engrais starter',
      description: "Apport d'engrais phospho-potassique",
      produit: 'DAP 18-46 + Bore',
      date: new Date('2030-09-05'),
      semences: 0,
      engrais: 95,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 30,
      phytos: 0,
      eiq: 0,
      mecanisation: 25,
      irrigation: 0,
      workTime: 0.8,
      gnr: 8,
      ges: 20.8,
      charges: 150,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '31',
      ordre: 31,
      category: '6 - Colza + sarrasin',
      name: 'Traitement insecticide',
      description: 'Traitement contre altises',
      produit: 'Insecticide pyréthrinoïde',
      date: new Date('2030-09-20'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 38,
      eiq: 18,
      mecanisation: 28,
      irrigation: 0,
      workTime: 1.0,
      gnr: 8,
      ges: 20.8,
      charges: 66,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '32',
      ordre: 32,
      category: '6 - Colza + sarrasin',
      name: 'Digestat liquide',
      description: "Apport de digestat 20m³/ha à l'automne",
      produit: 'Digestat liquide',
      date: new Date('2030-10-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 80,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 40,
      irrigation: 0,
      workTime: 1.3,
      gnr: 18,
      ges: 46.8,
      charges: 110,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '33',
      ordre: 33,
      category: '6 - Colza + sarrasin',
      name: 'Apport azoté de printemps',
      description: "Apport d'azote minéral 120 unités N",
      produit: 'Ammonitrate 33.5',
      date: new Date('2031-02-25'),
      semences: 0,
      engrais: 155,
      unitesMineral: 120,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 30,
      irrigation: 0,
      workTime: 0.9,
      gnr: 10,
      ges: 26,
      charges: 185,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '34',
      ordre: 34,
      category: '6 - Colza + sarrasin',
      name: 'Traitement fongicide',
      description: 'Traitement sclérotinia',
      produit: 'Fongicide anti-sclérotinia',
      date: new Date('2031-04-10'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 52,
      eiq: 22,
      mecanisation: 28,
      irrigation: 0,
      workTime: 1.0,
      gnr: 8,
      ges: 20.8,
      charges: 80,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '35',
      ordre: 35,
      category: '6 - Colza + sarrasin',
      name: 'Récolte',
      description: 'Moisson du colza',
      produit: '',
      date: new Date('2031-07-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 155,
      irrigation: 0,
      workTime: 2.8,
      gnr: 40,
      ges: 104,
      charges: 155,
      margeBrute: 1650,
      expanded: false
    },

    // 7 - Maïs grain
    {
      id: '36',
      ordre: 36,
      category: '7 - Maïs grain',
      name: 'Labour',
      description: "Labour d'automne 25cm",
      produit: '',
      date: new Date('2031-10-20'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 85,
      irrigation: 0,
      workTime: 2.5,
      gnr: 28,
      ges: 73.6,
      charges: 85,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '37',
      ordre: 37,
      category: '7 - Maïs grain',
      name: 'Digestat liquide',
      description: 'Epandage de digestat 30m³/ha',
      produit: 'Digestat liquide',
      date: new Date('2032-03-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 120,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 50,
      irrigation: 0,
      workTime: 1.6,
      gnr: 22,
      ges: 57.2,
      charges: 135,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '38',
      ordre: 38,
      category: '7 - Maïs grain',
      name: 'Préparation du lit de semences',
      description: 'Passage de herse rotative',
      produit: '',
      date: new Date('2032-04-10'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 40,
      irrigation: 0,
      workTime: 1.5,
      gnr: 15,
      ges: 39,
      charges: 40,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '39',
      ordre: 39,
      category: '7 - Maïs grain',
      name: 'Semis maïs',
      description: 'Semis de maïs 90 000 grains/ha',
      produit: 'Maïs grain hybride',
      date: new Date('2032-04-25'),
      semences: 195,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 55,
      irrigation: 0,
      workTime: 2.0,
      gnr: 16,
      ges: 41.6,
      charges: 250,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '40',
      ordre: 40,
      category: '7 - Maïs grain',
      name: 'Désherbage mixte',
      description: 'Herbicide de pré-levée + binage',
      produit: 'S-métolachlore',
      date: new Date('2032-05-10'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 42,
      eiq: 15,
      mecanisation: 55,
      irrigation: 0,
      workTime: 2.2,
      gnr: 18,
      ges: 46.8,
      charges: 97,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '41',
      ordre: 41,
      category: '7 - Maïs grain',
      name: 'Apport azoté',
      description: "Apport d'azote minéral 80 unités N",
      produit: 'Urée 46',
      date: new Date('2032-06-01'),
      semences: 0,
      engrais: 95,
      unitesMineral: 80,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 28,
      irrigation: 0,
      workTime: 0.8,
      gnr: 9,
      ges: 23.4,
      charges: 123,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '42',
      ordre: 42,
      category: '7 - Maïs grain',
      name: 'Irrigation x 4',
      description: 'Irrigation par enrouleur 4 passages',
      produit: '',
      date: new Date('2032-07-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      eiq: 0,
      mecanisation: 0,
      irrigation: 320,
      workTime: 3.5,
      gnr: 0,
      ges: 28,
      charges: 320,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '43',
      ordre: 43,
      category: '7 - Maïs grain',
      name: 'Récolte',
      description: 'Récolte du maïs grain',
      produit: '',
      date: new Date('2032-10-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      ift: 0,
      mecanisation: 195,
      irrigation: 0,
      workTime: 3.5,
      gnr: 52,
      ges: 135.2,
      charges: 195,
      margeBrute: 1950,
      expanded: false
    },

    // 8 - Phacélie (couvert)
    {
      id: '44',
      ordre: 44,
      category: '8 - Phacélie (couvert)',
      name: 'Semis phacélie',
      description: 'Semis de phacélie 10kg/ha',
      produit: 'Phacélie',
      date: new Date('2032-11-01'),
      semences: 42,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      ift: 0,
      mecanisation: 35,
      irrigation: 0,
      workTime: 1.2,
      gnr: 11,
      ges: 28.6,
      charges: 77,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '45',
      ordre: 45,
      category: '8 - Phacélie (couvert)',
      name: 'Destruction',
      description: 'Destruction au rouleau faca',
      produit: '',
      date: new Date('2033-03-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      ift: 0,
      mecanisation: 30,
      irrigation: 0,
      workTime: 1.0,
      gnr: 10,
      ges: 26,
      charges: 30,
      margeBrute: 0,
      expanded: false
    },

    // 9 - Méteil grain
    {
      id: '46',
      ordre: 46,
      category: '9 - Méteil grain',
      name: 'Semis méteil',
      description: 'Semis de méteil (triticale, pois, vesce) 180kg/ha',
      produit: 'Méteil (triticale + pois + vesce)',
      date: new Date('2033-03-25'),
      semences: 125,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      ift: 0,
      mecanisation: 48,
      irrigation: 0,
      workTime: 1.8,
      gnr: 13,
      ges: 33.8,
      charges: 173,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '47',
      ordre: 47,
      category: '9 - Méteil grain',
      name: 'Désherbage mécanique',
      description: 'Herse étrille',
      produit: '',
      date: new Date('2033-04-20'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      ift: 0,
      mecanisation: 25,
      irrigation: 0,
      workTime: 1.2,
      gnr: 8,
      ges: 20.8,
      charges: 25,
      margeBrute: 0,
      expanded: false
    },
    {
      id: '48',
      ordre: 48,
      category: '9 - Méteil grain',
      name: 'Récolte',
      description: 'Moisson du méteil',
      produit: '',
      date: new Date('2033-07-15'),
      semences: 0,
      engrais: 0,
      unitesMineral: 0,
      azoteOrganique: 0,
      oligos: 0,
      phytos: 0,
      ift: 0,
      mecanisation: 145,
      irrigation: 0,
      workTime: 2.8,
      gnr: 38,
      ges: 98.8,
      charges: 145,
      margeBrute: 980,
      expanded: false
    }
  ];

  const [interventions, setInterventions] = useState<InterventionData[]>(originaleInterventionsData);
  const [systemData, setSystemData] = useState<any>(null);
  const [systemName, setSystemName] = useState<string>('');
  const [farmerName, setFarmerName] = useState<string>('');
  const [farmName, setFarmName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Charger les données du système depuis l'API
  useEffect(() => {
    if (!isMounted) return;

    setIsLoading(true);
    fetch(`/api/systems/${projectId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('System not found');
        }
        return res.json();
      })
      .then(system => {
        if (system.json) {
          setSystemData(system.json);
        }
        setSystemName(system.name || 'Rotation Bio 2027-2033');
        setFarmerName(system.farmer_name || 'Jean Dupont');
        setFarmName(system.farm_name || 'EARL Dupont');
      })
      .catch(error => {
        console.error('Erreur lors du chargement du système:', error);
        // Valeurs par défaut en cas d'erreur
        setSystemName('Rotation Bio 2027-2033');
        setFarmerName('Jean Dupont');
        setFarmName('EARL Dupont');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [projectId, isMounted]);

  const [rotationData] = useState<RotationData[]>([
    {
      id: 'r1',
      name: 'Orge + Lupin',
      startDate: new Date('2027-09-15'),
      endDate: new Date('2028-07-10'),
      color: '#F59E0B',
      layer: 0
    },
    {
      id: 'r2',
      name: 'Luzerne + trèfle violet et blanc',
      startDate: new Date('2028-08-01'),
      endDate: new Date('2029-05-20'),
      color: '#8B5CF6',
      layer: 0
    },
    {
      id: 'r3',
      name: 'CIVE (Triticale)',
      startDate: new Date('2029-02-15'),
      endDate: new Date('2029-05-20'),
      color: '#10B981',
      layer: 0
    },
    {
      id: 'r4',
      name: 'Quinoa',
      startDate: new Date('2029-06-15'),
      endDate: new Date('2029-09-10'),
      color: '#06B6D4',
      layer: 0
    },
    {
      id: 'r5',
      name: 'Blé + féverole',
      startDate: new Date('2029-11-01'),
      endDate: new Date('2030-07-25'),
      color: '#F59E0B',
      layer: 0
    },
    {
      id: 'r6',
      name: 'Colza + sarrasin',
      startDate: new Date('2030-08-05'),
      endDate: new Date('2031-07-15'),
      color: '#FBBF24',
      layer: 0
    },
    {
      id: 'r7',
      name: 'Maïs grain',
      startDate: new Date('2031-10-20'),
      endDate: new Date('2032-10-15'),
      color: '#EAB308',
      layer: 0
    },
    {
      id: 'r8',
      name: 'Phacélie (couvert)',
      startDate: new Date('2032-11-01'),
      endDate: new Date('2033-03-15'),
      color: '#84CC16',
      layer: 0
    },
    {
      id: 'r9',
      name: 'Méteil grain',
      startDate: new Date('2033-03-25'),
      endDate: new Date('2033-07-15'),
      color: '#22C55E',
      layer: 0
    }
  ]);

  const [currentVariant, setCurrentVariant] = useState(variant);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [chatOpen, setChatOpen] = useState(true);
  const [focusedCell, setFocusedCell] = useState<{ interventionName: string; columnName: string } | null>(null);
  const [contextualMessages, setContextualMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);

  const variants = ['Originale', 'Variante 1'];

  const updateIntervention = (id: string, field: string, value: any) => {
    setInterventions(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const getColumnLabel = (columnName: string): string => {
    const labels: Record<string, string> = {
      semences: 'semences',
      engrais: 'engrais',
      unitesMineral: 'unités minéral',
      azoteOrganique: 'azote organique',
      oligos: 'rendement',
      phytos: 'phytos',
      ift: 'IFT',
      hri1: 'HRI1',
      mecanisation: 'mécanisation',
      irrigation: 'irrigation',
      workTime: 'temps de travail',
      gnr: 'GNR',
      ges: 'GES',
      charges: 'charges',
      prixVente: 'prix de vente',
      margeBrute: 'marge brute'
    };
    return labels[columnName] || columnName;
  };

  const handleCellChange = (interventionName: string, columnName: string, oldValue: any, newValue: any) => {
    if (chatOpen) {
      const columnLabel = getColumnLabel(columnName);
      const newMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: 'Je vois que vous avez modifié le montant des ' + columnLabel + ' pour "' + interventionName + '", pouvez-vous m' + String.fromCharCode(39) + 'expliquer pourquoi ?',
        timestamp: new Date()
      };
      setContextualMessages(prev => [...prev, newMessage]);
    }
  };

  // Changer les interventions quand la variante change
  useEffect(() => {
    if (currentVariant === 'Variante 1') {
      setInterventions(variant1Interventions);
    } else {
      setInterventions(originaleInterventionsData);
    }
  }, [currentVariant]);

  // Ne pas rendre le composant tant qu'il n'est pas monté côté client
  if (!isMounted) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f5f5f0]">
      {/* TopBar en haut de tout */}
      <TopBar
        variant="project"
        onNavigateToList={onBack}
        currentVariant={currentVariant}
        onVariantChange={setCurrentVariant}
        rotationTitle={isLoading ? 'Chargement...' : systemName}
      />

      {/* Contenu principal et ChatBot côte à côte en dessous de la TopBar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Project title */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="mb-2">
                  {isLoading ? 'Chargement...' : `${systemName}-${currentVariant}`}
                </h1>
                <p className="text-gray-600">
                  {isLoading ? 'Chargement des informations...' : `${farmerName} • ${farmName}`}
                  <br />15 ha • Bio • Toulouse (31) • Sol argileux
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-colors text-sm">
                <ChevronsRight className="size-4" />
                Modifier l&apos;itinéraire technique
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-colors text-sm">
                <FolderOpen className="size-4" />
                Charger une rotation
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-colors text-sm">
                <Download className="size-4" />
                Exporter (.xsls)
              </button>
              <button className="group flex items-center gap-0 hover:gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-all duration-300 text-sm">
                <Settings className="size-4" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
                  Réglages
                </span>
              </button>
              <button className="group flex items-center gap-0 hover:gap-2 px-3 py-1.5 bg-[#6b9571] text-white rounded hover:bg-red-600 transition-all duration-300 text-sm">
                <Trash2 className="size-4" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
                  Tout effacer
                </span>
              </button>
              {!chatOpen && (
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="flex items-center gap-2 px-[12px] py-[8px] bg-[#6b9571] text-white rounded hover:bg-[#5a8560] transition-colors text-sm"
                  title="Ouvrir l'assistant IA"
                >
                  <Sparkles className="size-4" />
                  <ChevronDown className="size-4 rotate-90" />
                </button>
              )}
            </div>
          </div>

          {/* Rotation Timeline - Itinéraire Technique */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
            <ItineraireTechnique
              data={systemData}
              className="w-full"
            />
          </section>          {/* Context Panel Section */}
          <ContextPanel />

          {/* Interventions Table Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <InterventionsTable
              interventions={interventions}
              updateIntervention={updateIntervention}
              surface={projectSurface}
              startYear={rotationStartYear}
              endYear={rotationEndYear}
              onCellFocus={(interventionId, interventionName, columnName) => {
                setFocusedCell({ interventionName, columnName });
              }}
              onCellBlur={() => setFocusedCell(null)}
              onCellChange={handleCellChange}
            />
          </section>
        </main>

        {/* ChatBot side panel */}
        <ChatBot
          interventions={interventions}
          setInterventions={setInterventions}
          isOpen={chatOpen}
          setIsOpen={setChatOpen}
          focusedCell={focusedCell}
          contextualMessages={contextualMessages}
          onAddContextualMessage={(message) => {
            setContextualMessages(prev => [...prev, message]);
          }}
        />
      </div>
    </div>
  );
}