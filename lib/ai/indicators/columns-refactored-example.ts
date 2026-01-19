/**
 * Example of how columns.ts could be refactored using the Indicator architecture
 * This is a demonstration file - the actual columns.ts hasn't been modified yet
 */

import { ColumnDef } from '@tanstack/react-table';
import { InterventionRow } from '@/components/interventions-table/types';
import { IndicatorFactory } from '@/lib/ai/indicators';

// ============================================================================
// Approach 1: Manual column definitions with indicator for metadata
// ============================================================================

export const interventionColumnsV1: ColumnDef<InterventionRow>[] = [
  // Non-grouped columns (unchanged)
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

  // Agronomie group
  {
    id: 'agronomie',
    header: 'Agronomie',
    columns: [
      IndicatorFactory.create('frequence').getColumnHeader(),
      IndicatorFactory.create('azoteMineral').getColumnHeader(),
      IndicatorFactory.create('azoteOrganique').getColumnHeader(),
    ],
  },

  // Environmental group
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

  // Economic group
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

// ============================================================================
// Approach 2: Dynamic column generation from configuration
// ============================================================================

interface ColumnGroup {
  id: string;
  header: string;
  indicators: string[];
}

const columnGroups: ColumnGroup[] = [
  {
    id: 'agronomie',
    header: 'Agronomie',
    indicators: ['frequence', 'azoteMineral', 'azoteOrganique'],
  },
  {
    id: 'environnemental',
    header: 'Environnemental et social',
    indicators: ['ift', 'eiq', 'ges', 'tempsTravail'],
  },
  {
    id: 'economique',
    header: 'Économique',
    indicators: [
      'coutsPhytos',
      'semences',
      'engrais',
      'mecanisation',
      'gnr',
      'irrigation',
      'totalCharges',
      'rendementTMS',
      'prixVente',
      'totalProduits',
      'margeBrute',
    ],
  },
];

export const interventionColumnsV2: ColumnDef<InterventionRow>[] = [
  // Non-grouped columns
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

  // Dynamic grouped columns
  ...columnGroups.map((group) => ({
    id: group.id,
    header: group.header,
    columns: group.indicators.map((key) => 
      IndicatorFactory.create(key).getColumnHeader()
    ),
  })),
];

// ============================================================================
// Approach 3: Completely dynamic from indicator factory
// ============================================================================

export function generateInterventionColumns(): ColumnDef<InterventionRow>[] {
  // Start with non-indicator columns
  const baseColumns: ColumnDef<InterventionRow>[] = [
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
  ];

  // Add grouped indicator columns
  const groupedColumns: ColumnDef<InterventionRow>[] = columnGroups.map((group) => ({
    id: group.id,
    header: group.header,
    columns: group.indicators.map((key) => {
      const indicator = IndicatorFactory.create(key);
      return {
        ...indicator.getColumnHeader(),
        // Can override or extend here if needed
      };
    }),
  }));

  return [...baseColumns, ...groupedColumns];
}

// ============================================================================
// Approach 4: With custom overrides for specific columns
// ============================================================================

export function generateColumnsWithOverrides(): ColumnDef<InterventionRow>[] {
  const baseColumns: ColumnDef<InterventionRow>[] = [
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
  ];

  // Custom overrides for specific columns
  const columnOverrides: Record<string, Partial<ColumnDef<InterventionRow>>> = {
    totalCharges: {
      meta: { 
        align: 'center', 
        editable: false, // Not editable, calculated
        fieldType: 'number',
        className: 'font-bold bg-gray-100',
      },
    },
    margeBrute: {
      meta: { 
        align: 'center', 
        editable: false,
        fieldType: 'number',
        className: 'font-bold bg-green-100',
      },
    },
  };

  const groupedColumns = columnGroups.map((group) => ({
    id: group.id,
    header: group.header,
    columns: group.indicators.map((key) => {
      const indicator = IndicatorFactory.create(key);
      const baseColumn = indicator.getColumnHeader();
      const override = columnOverrides[key] || {};

      return {
        ...baseColumn,
        ...override,
        // Merge meta objects
        meta: {
          ...baseColumn.meta,
          ...override.meta,
        },
      };
    }),
  }));

  return [...baseColumns, ...groupedColumns];
}

// ============================================================================
// Usage examples
// ============================================================================

/*
// In your component:

import { generateInterventionColumns } from './columns-refactored';

function InterventionsTable() {
  const columns = generateInterventionColumns();
  
  return (
    <DataTable 
      columns={columns}
      data={interventions}
    />
  );
}

// Or with overrides:

import { generateColumnsWithOverrides } from './columns-refactored';

function InterventionsTable() {
  const columns = generateColumnsWithOverrides();
  
  return (
    <DataTable 
      columns={columns}
      data={interventions}
    />
  );
}
*/
