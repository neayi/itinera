/**
 * DTOs partagés entre le backend et le frontend pour les utilisateurs
 */

export interface UserDTO {
  id: number;
  external_id: string;
  name: string;
  email: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}
