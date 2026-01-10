import { ColumnDef } from '@tanstack/react-table';
import { InterventionRow } from './types';

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
    accessorKey: 'produit',
    header: 'Produit',
    cell: (info) => info.getValue() || '-',
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
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'unitesMineral',
        header: 'Unités minéral',
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'azoteOrganique',
        header: 'Azote organique',
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'rendementTMS',
        header: 'Rendement',
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
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
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'eiq',
        header: 'EIQ',
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'ges',
        header: 'GES',
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'tempsTravail',
        header: 'Temps de travail',
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
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
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'semences',
        header: 'Semences',
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'engrais',
        header: 'Engrais',
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'mecanisation',
        header: 'Mécanisation',
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'gnr',
        header: 'GNR',
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'irrigation',
        header: 'Irrigation',
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'totalCharges',
        header: 'Total charges',
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'prixVente',
        header: 'Prix de vente',
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
      {
        accessorKey: 'margeBrute',
        header: 'Marge brute',
        cell: (info) => info.getValue() || '-',
        meta: { align: 'center' },
      },
    ],
  },
];
