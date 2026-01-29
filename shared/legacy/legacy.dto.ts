/**
 * DTOs legacy pour les itinéraires (backward compatibility)
 */

export interface ItineraryDTO {
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

export interface InterventionDataDTO {
  id: string;
  ordre: number;
  category: string;
  name: string;
  description?: string;
  produit?: string;
  semences?: number;
  engrais?: number;
  azoteMineral?: number;
  azoteOrganique?: number;
  oligos?: number;
  phytos?: number;
  eiq?: number;
  ift?: number;
  hri1?: number;
  mecanisation?: number;
  irrigation?: number;
  date: Date;
  frequence?: number;
  cost?: number;
  workTime: number;
  gnr?: number;
  ges: number;
  charges: number;
  prixVente?: number;
  margeBrute?: number;
  expanded?: boolean;
}

export interface RotationDataDTO {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
  layer: number;
}
