// Type pour une intervention individuelle
export interface InterventionRow {
  id: string;
  stepIndex: number;
  interventionIndex: number;
  name: string;
  description: string;
  date: string;
  frequence: number;
  azoteMineral: number;
  azoteOrganique: number;
  rendementTMS: number;
  ift: number;
  eiq: number;
  ges: number;
  tempsTravail: number;
  coutsPhytos: number;
  semences: number;
  engrais: number;
  mecanisation: number;
  gnr: number;
  irrigation: number;
  totalProduits: number;
  totalCharges: number;
  prixVente: number;
  margeBrute: number;
  isStepTotal?: boolean; // Indicateur pour les lignes de totaux
  stepName?: string; // Nom du step pour les lignes de totaux
}

export interface InterventionsDataTableProps {
  systemData: any;
  systemId: string;
  onUpdate?: (updatedSystemData: any) => void;
}
