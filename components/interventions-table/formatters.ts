// Fonction de formatage des valeurs numériques avec unités

export type FieldKey = 
  | 'frequence'
  | 'azoteMineral'
  | 'azoteOrganique'
  | 'rendementTMS'
  | 'ift'
  | 'eiq'
  | 'ges'
  | 'tempsTravail'
  | 'coutsPhytos'
  | 'semences'
  | 'engrais'
  | 'mecanisation'
  | 'gnr'
  | 'irrigation'
  | 'totalCharges'
  | 'prixVente'
  | 'margeBrute';

export function formatValue(value: number | string | null | undefined, fieldKey: FieldKey): string {
  // Convertir en nombre si c'est une chaîne
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (numValue === null || numValue === undefined || isNaN(numValue) || numValue === 0) {
    return '-';
  }

  switch (fieldKey) {
    // Arrondi avec 1 chiffre après la virgule (toujours affiché), pas d'unité
    case 'frequence':
    case 'ift':
      return numValue.toFixed(1);

    // Arrondi avec max 1 chiffre après la virgule, unité : kg
    case 'azoteMineral':
    case 'azoteOrganique':
      return `${numValue % 1 === 0 ? numValue.toFixed(0) : numValue.toFixed(1)} kg`;

    // Arrondi sans chiffre après la virgule, unité : qtx
    case 'rendementTMS':
      return `${Math.round(numValue)} qtx`;

    // Arrondi sans chiffre après la virgule, sans unité
    case 'eiq':
      return `${Math.round(numValue)}`;

    // Pas d'arrondi, unité : TeqCO2
    case 'ges':
      return `${numValue} TeqCO2`;

    // Arrondi sans chiffre après la virgule, unité : h
    case 'tempsTravail':
      return `${numValue % 1 === 0 ? numValue.toFixed(0) : numValue.toFixed(1)} h`;

    // Arrondi sans chiffre après la virgule, unité : €
    case 'coutsPhytos':
    case 'semences':
    case 'engrais':
    case 'mecanisation':
    case 'gnr':
    case 'irrigation':
    case 'totalCharges':
    case 'prixVente':
    case 'margeBrute':
      return `${Math.round(numValue)} €`;

    default:
      return String(numValue);
  }
}
