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

export function formatValue(value: number | null | undefined, fieldKey: FieldKey): string {
  if (value === null || value === undefined || value === 0) {
    return '-';
  }

  switch (fieldKey) {
    // Arrondi avec 1 chiffre après la virgule (toujours affiché), pas d'unité
    case 'frequence':
    case 'ift':
      return value.toFixed(1);

    // Arrondi avec max 1 chiffre après la virgule, unité : U (unité d'azote)
    case 'azoteMineral':
    case 'azoteOrganique':
      return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} U`;

    // Arrondi sans chiffre après la virgule, unité : qtx
    case 'rendementTMS':
      return `${Math.round(value)} qtx`;

    // Arrondi sans chiffre après la virgule, sans unité
    case 'eiq':
      return `${Math.round(value)}`;

    // Pas d'arrondi, unité : TeqCO2
    case 'ges':
      return `${value} TeqCO2`;

    // Arrondi sans chiffre après la virgule, unité : h
    case 'tempsTravail':
      return `${Math.round(value)} h`;

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
      return `${Math.round(value)} €`;

    default:
      return String(value);
  }
}
