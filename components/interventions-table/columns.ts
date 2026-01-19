import { ColumnDef } from '@tanstack/react-table';
import { InterventionRow } from './types';
import { IndicatorFactory } from '@/lib/ai/indicators/indicator-factory';

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
      IndicatorFactory.create('frequence').getColumnHeader(),
      IndicatorFactory.create('azoteMineral').getColumnHeader(),
      IndicatorFactory.create('azoteOrganique').getColumnHeader(),
    ],
  },
  // Groupe Environnemental et social
  {
    id: 'environnemental',
    header: 'Environnemental et social',
    columns: [
      IndicatorFactory.create('ift').getColumnHeader(),
      IndicatorFactory.create('eiq').getColumnHeader(),
      IndicatorFactory.create('ges').getColumnHeader(),
      IndicatorFactory.create('tempsTravail').getColumnHeader(),
    ],
  },
  // Groupe Économique
  {
    id: 'economique',
    header: 'Économique',
    columns: [
      IndicatorFactory.create('coutsPhytos').getColumnHeader(),
      IndicatorFactory.create('semences').getColumnHeader(),
      IndicatorFactory.create('engrais').getColumnHeader(),
      IndicatorFactory.create('mecanisation').getColumnHeader(),
      IndicatorFactory.create('gnr').getColumnHeader(),
      IndicatorFactory.create('irrigation').getColumnHeader(),
      IndicatorFactory.create('totalCharges').getColumnHeader(),
      IndicatorFactory.create('rendementTMS').getColumnHeader(),
      IndicatorFactory.create('prixVente').getColumnHeader(),
      IndicatorFactory.create('totalProduits').getColumnHeader(),
      IndicatorFactory.create('margeBrute').getColumnHeader(),
    ],
  },
];
