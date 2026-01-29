/**
 * DTOs pour les propriétés du sol
 */

export interface SoilPropertiesDTO {
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
