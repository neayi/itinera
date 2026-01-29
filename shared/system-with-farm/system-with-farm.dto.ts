/**
 * DTO pour les systèmes avec données de ferme (lecture seule)
 * Utilisé pour les vues avec jointures
 */

export interface SystemWithFarmDTO {
  id: string;
  farm_id: number | null;
  user_id: number;
  name: string;
  description: string | null;
  system_type: string | null;
  productions: string | null;
  gps_location: string | null;
  dept_no: string | null;
  town: string | null;
  json: any;
  eiq: number | null;
  gross_margin: number | null;
  duration: number | null;
  created_at: Date;
  updated_at: Date;
  
  // Données de la ferme (jointure)
  farm_name: string | null;
  farmer_name: string | null;
}
