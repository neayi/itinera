/**
 * DTOs pour les exploitations agricoles (farms)
 */

export interface FarmDTO {
  id: number;
  name: string;
  farmer_name: string;
  created_at: Date;
  updated_at: Date;
}
