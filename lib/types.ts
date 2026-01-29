/**
 * Types legacy - Référence les DTOs dans shared/ pour rétrocompatibilité
 * @deprecated Utiliser les DTOs dans shared/ à la place
 */

export type { FarmDTO as Farm } from '@/shared/farm/farm.dto';
export type { SystemWithFarmDTO as SystemWithFarm } from '@/shared/system-with-farm/system-with-farm.dto';
export type { ItineraryDTO as Itinerary } from '@/shared/legacy/legacy.dto';
export type { InterventionDataDTO as InterventionData } from '@/shared/legacy/legacy.dto';
export type { RotationDataDTO as RotationData } from '@/shared/legacy/legacy.dto';
export type { SoilPropertiesDTO as SoilProperties } from '@/shared/soil/soil.dto';
export type {
  ConfidenceLevel,
  ValueStatus,
  ConversationMessage,
  InterventionValue,
  StepValue,
  CalculationContext,
  CalculationResult
} from '@/shared/ai/ai.dto';
