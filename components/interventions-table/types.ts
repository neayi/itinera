// Type pour une intervention individuelle
export interface InterventionRow {
  id: string;
  stepIndex: number;
  interventionIndex: number;
  name: string;
  description: string;
  produit: string;
  date: string;
  frequence: string;
  unitesMineral: string;
  azoteOrganique: string;
  rendementTMS: string;
  ift: string;
  eiq: string;
  ges: string;
  tempsTravail: string;
  coutsPhytos: string;
  semences: string;
  engrais: string;
  mecanisation: string;
  gnr: string;
  irrigation: string;
  totalCharges: string;
  prixVente: string;
  margeBrute: string;
  isStepTotal?: boolean; // Indicateur pour les lignes de totaux
  stepName?: string; // Nom du step pour les lignes de totaux
}

export interface InterventionsDataTableProps {
  systemData: any;
  systemId: string;
  onUpdate?: (updatedSystemData: any) => void;
}
