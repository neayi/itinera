import { ColumnDef } from '@tanstack/react-table';
import { InterventionRow } from './types';
import { formatValue, FieldKey } from './formatters';

// Définition des colonnes avec groupes
export const interventionColumns: ColumnDef<InterventionRow>[] = [
  // Colonnes non groupées
  {
    accessorKey: 'name',
    header: 'Intervention',
    cell: (info) => info.getValue(),
    size: 250,
    meta: { editable: true },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: (info) => info.getValue(),
    size: 250,
    meta: { editable: true, multiline: true },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: (info) => info.getValue() || '-',
    meta: { align: 'center', editable: true },
  },
  // Groupe Agronomie
  {
    id: 'agronomie',
    header: 'Agronomie',
    columns: [
      {
        accessorKey: 'frequence',
        header: 'Fréquence',
        cell: (info) => formatValue(info.getValue() as number, 'frequence'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'azoteMineral',
        header: 'Azote minéral',
        cell: (info) => formatValue(info.getValue() as number, 'azoteMineral'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'azoteOrganique',
        header: 'Azote organique',
        cell: (info) => formatValue(info.getValue() as number, 'azoteOrganique'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
    ],
  },
  // Groupe Environnemental et social
  {
    id: 'environnemental',
    header: 'Environnemental et social',
    columns: [
      {
        accessorKey: 'ift',
        header: 'IFT',
        cell: (info) => formatValue(info.getValue() as number, 'ift'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'eiq',
        header: 'EIQ',
        cell: (info) => formatValue(info.getValue() as number, 'eiq'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'ges',
        header: 'GES',
        cell: (info) => formatValue(info.getValue() as number, 'ges'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'tempsTravail',
        header: 'Temps de travail',
        cell: (info) => formatValue(info.getValue() as number, 'tempsTravail'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
    ],
  },
  // Groupe Économique
  {
    id: 'economique',
    header: 'Économique',
    columns: [
      {
        accessorKey: 'coutsPhytos',
        header: 'Coûts phytos',
        cell: (info) => formatValue(info.getValue() as number, 'coutsPhytos'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'semences',
        header: 'Semences',
        cell: (info) => formatValue(info.getValue() as number, 'semences'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'engrais',
        header: 'Engrais',
        cell: (info) => formatValue(info.getValue() as number, 'engrais'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'mecanisation',
        header: 'Mécanisation',
        cell: (info) => formatValue(info.getValue() as number, 'mecanisation'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'gnr',
        header: 'GNR',
        cell: (info) => formatValue(info.getValue() as number, 'gnr'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'irrigation',
        header: 'Irrigation',
        cell: (info) => formatValue(info.getValue() as number, 'irrigation'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'totalCharges',
        header: 'Total charges',
        cell: (info) => formatValue(info.getValue() as number, 'totalCharges'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'rendementTMS',
        header: 'Rendement',
        cell: (info) => formatValue(info.getValue() as number, 'rendementTMS'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'prixVente',
        header: 'Prix de vente',
        cell: (info) => formatValue(info.getValue() as number, 'prixVente'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'totalProduits',
        header: 'Total produits',
        cell: (info) => formatValue(info.getValue() as number, 'totalProduits'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'margeBrute',
        header: 'Marge brute',
        cell: (info) => formatValue(info.getValue() as number, 'margeBrute'),
        meta: { align: 'center', editable: false, fieldType: 'number' },
      },
    ],
  },
];
