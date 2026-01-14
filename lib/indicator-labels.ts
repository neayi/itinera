/**
 * Labels des indicateurs pour affichage dans l'interface
 * Utilisé par les colonnes du tableau et l'assistant IA
 */
export const INDICATOR_LABELS: Record<string, string> = {
  frequence: 'Fréquence',
  azoteMineral: 'Azote minéral',
  azoteOrganique: 'Azote organique',
  ift: 'IFT',
  eiq: 'EIQ',
  ges: 'GES',
  tempsTravail: 'Temps de travail',
  coutsPhytos: 'Coûts phytos',
  semences: 'Semences',
  engrais: 'Engrais',
  mecanisation: 'Mécanisation',
  gnr: 'GNR',
  irrigation: 'Irrigation',
  totalCharges: 'Total charges',
  rendementTMS: 'Rendement',
  rendement: 'Rendement',
  prixVente: 'Prix de vente',
  totalProduits: 'Total produits',
  margeBrute: 'Marge brute',
};

export function getIndicatorLabel(key: string): string {
  return INDICATOR_LABELS[key] || key;
}
