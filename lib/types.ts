// Database types
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface Farm {
  id: number;
  name: string;
  farmer_name: string;
  gps_location?: string;
  town?: string;
  created_at: Date;
  updated_at: Date;
}

export interface System {
  id: number;
  farm_id: number;
  name: string;
  description?: string;
  system_type?: string;
  productions?: string;
  gps_location?: string;
  json?: any;
  eiq?: number;
  gross_margin?: number;
  duration?: number;
  created_at: Date;
  updated_at: Date;
}

// Extended types with joined data
export interface SystemWithFarm extends System {
  farm_name?: string;
  farmer_name?: string;
  town?: string;
}

// UI types (for backward compatibility with existing components)
export interface Itinerary {
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

// Legacy types for existing components
export interface InterventionData {
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

export interface RotationData {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
  layer: number;
}

export interface SoilProperties {
  physical: {
    texture: string;
    profondeur: string;
    drainage: string;
  };
  chemical: {
    ph: number;
    matiere_organique: string;
    azote: string;
  };
  classification: string;
}

// AI Assistant types
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type ValueStatus = 'user' | 'calculated' | 'ia' | 'n/a';

export interface ConversationMessage {
  role: 'system' | 'assistant' | 'user';
  content: string;
  timestamp: string;
  assumptions?: string[];
  calculation_steps?: string[];
  sources?: string[];
  confidence?: ConfidenceLevel;
  caveats?: string[];
}

export interface InterventionValue {
  key: string;
  value: number | string;
  status?: ValueStatus;
  confidence?: ConfidenceLevel;
  conversation?: ConversationMessage[];
}

export interface StepValue {
  key: string;
  value: number | string;
  status?: ValueStatus;
  confidence?: ConfidenceLevel;
  conversation?: ConversationMessage[];
}

export interface CalculationContext {
  systemData: any;
  stepIndex: number;
  interventionIndex: number;
  indicatorKey: string;
}

export interface CalculationResult {
  value: number | string;
  confidence: ConfidenceLevel;
  conversation: ConversationMessage[];
  assumptionsMarkdown?: string;
  assumptionsLevel?: 'system' | 'step' | 'intervention';
  sources: string[];
  calculationSteps?: string[];
  caveats?: string[];
  status?: ValueStatus;
}
