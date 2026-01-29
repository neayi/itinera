/**
 * DTOs pour l'assistant IA et les calculs d'indicateurs
 */

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
