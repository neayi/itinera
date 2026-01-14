import { ColumnDef } from '@tanstack/react-table';
import { InterventionRow } from './types';
import { formatValue, FieldKey } from './formatters';
import { INDICATOR_LABELS } from '@/lib/indicator-labels';

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
        header: INDICATOR_LABELS.frequence,
        cell: (info) => formatValue(info.getValue() as number, 'frequence'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'azoteMineral',
        header: INDICATOR_LABELS.azoteMineral,
        cell: (info) => formatValue(info.getValue() as number, 'azoteMineral'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'azoteOrganique',
        header: INDICATOR_LABELS.azoteOrganique,
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
        header: INDICATOR_LABELS.ift,
        cell: (info) => formatValue(info.getValue() as number, 'ift'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'eiq',
        header: INDICATOR_LABELS.eiq,
        cell: (info) => formatValue(info.getValue() as number, 'eiq'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'ges',
        header: INDICATOR_LABELS.ges,
        cell: (info) => formatValue(info.getValue() as number, 'ges'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'tempsTravail',
        header: INDICATOR_LABELS.tempsTravail,
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
        header: INDICATOR_LABELS.coutsPhytos,
        cell: (info) => formatValue(info.getValue() as number, 'coutsPhytos'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'semences',
        header: INDICATOR_LABELS.semences,
        cell: (info) => formatValue(info.getValue() as number, 'semences'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'engrais',
        header: INDICATOR_LABELS.engrais,
        cell: (info) => formatValue(info.getValue() as number, 'engrais'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'mecanisation',
        header: INDICATOR_LABELS.mecanisation,
        cell: (info) => formatValue(info.getValue() as number, 'mecanisation'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'gnr',
        header: INDICATOR_LABELS.gnr,
        cell: (info) => formatValue(info.getValue() as number, 'gnr'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'irrigation',
        header: INDICATOR_LABELS.irrigation,
        cell: (info) => formatValue(info.getValue() as number, 'irrigation'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'totalCharges',
        header: INDICATOR_LABELS.totalCharges,
        cell: (info) => formatValue(info.getValue() as number, 'totalCharges'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'rendementTMS',
        header: INDICATOR_LABELS.rendementTMS,
        cell: (info) => formatValue(info.getValue() as number, 'rendementTMS'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'prixVente',
        header: INDICATOR_LABELS.prixVente,
        cell: (info) => formatValue(info.getValue() as number, 'prixVente'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'totalProduits',
        header: INDICATOR_LABELS.totalProduits,
        cell: (info) => formatValue(info.getValue() as number, 'totalProduits'),
        meta: { align: 'center', editable: true, fieldType: 'number' },
      },
      {
        accessorKey: 'margeBrute',
        header: INDICATOR_LABELS.margeBrute,
        cell: (info) => formatValue(info.getValue() as number, 'margeBrute'),
        meta: { align: 'center', editable: false, fieldType: 'number' },
      },
    ],
  },
];
