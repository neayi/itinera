/**
 * DTOs pour les paramètres Itinera
 */

export interface ItineraParamDTO {
  key: string;
  value_int: number | null;
  value_datetime: Date | null;
  value_string: string | null;
  created_at: Date;
  updated_at: Date;
}
