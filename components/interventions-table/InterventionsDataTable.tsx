'use client';

import { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import './interventions-table.css';

// Type pour une intervention individuelle
interface InterventionRow {
  id: string;
  stepIndex: number;
  interventionIndex: number;
  name: string;
  description: string;
  produit: string;
  date: string;
  frequence: string;
  unitesMineral: string;
  azoteOrganique: string;
  rendementTMS: string;
  ift: string;
  eiq: string;
  ges: string;
  tempsTravail: string;
  coutsPhytos: string;
  semences: string;
  engrais: string;
  mecanisation: string;
  gnr: string;
  irrigation: string;
  totalCharges: string;
  prixVente: string;
  margeBrute: string;
}

interface InterventionsDataTableProps {
  systemData: any;
}

export function InterventionsDataTable({ systemData }: InterventionsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Extraire les interventions de systemData
  const interventionsData = useMemo(() => {
    if (!systemData?.steps) return [];

    const rows: InterventionRow[] = [];
    
    systemData.steps.forEach((step: any, stepIndex: number) => {
      if (step.interventions && Array.isArray(step.interventions)) {
        step.interventions.forEach((intervention: any, interventionIndex: number) => {
          // Calculer la date en ajoutant les jours à la startDate du step
          let dateStr = '';
          if (step.startDate && intervention.day !== undefined) {
            try {
              const startDate = new Date(step.startDate);
              let interventionDate = new Date(startDate);
              interventionDate.setDate(startDate.getDate() + (Number)(intervention.day));
              dateStr = interventionDate.toLocaleDateString('fr-FR');
            } catch (e) {
              dateStr = '';
            }
          }

          rows.push({
            id: `${stepIndex}-${interventionIndex}`,
            stepIndex,
            interventionIndex,
            name: intervention.name || '',
            description: intervention.description || '',
            produit: '',
            date: dateStr,
            frequence: '',
            unitesMineral: '',
            azoteOrganique: '',
            rendementTMS: '',
            ift: '',
            eiq: '',
            ges: '',
            tempsTravail: '',
            coutsPhytos: '',
            semences: '',
            engrais: '',
            mecanisation: '',
            gnr: '',
            irrigation: '',
            totalCharges: '',
            prixVente: '',
            margeBrute: '',
          });
        });
      }
    });

    return rows;
  }, [systemData]);

  // Définition des colonnes avec groupes
  const columns = useMemo<ColumnDef<InterventionRow>[]>(
    () => [
      // Colonnes non groupées
      {
        accessorKey: 'name',
        header: 'Intervention',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: (info) => info.getValue(),
        size: 250,
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
          },
          {
            accessorKey: 'unitesMineral',
            header: 'Unités minéral',
            cell: (info) => info.getValue() || '-',
          },
          {
            accessorKey: 'azoteOrganique',
            header: 'Azote organique',
            cell: (info) => info.getValue() || '-',
          },
          {
            accessorKey: 'rendementTMS',
            header: 'Rendement',
            cell: (info) => info.getValue() || '-',
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
          },
          {
            accessorKey: 'eiq',
            header: 'EIQ',
            cell: (info) => info.getValue() || '-',
          },
          {
            accessorKey: 'ges',
            header: 'GES',
            cell: (info) => info.getValue() || '-',
          },
          {
            accessorKey: 'tempsTravail',
            header: 'Temps de travail',
            cell: (info) => info.getValue() || '-',
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
          },
          {
            accessorKey: 'semences',
            header: 'Semences',
            cell: (info) => info.getValue() || '-',
          },
          {
            accessorKey: 'engrais',
            header: 'Engrais',
            cell: (info) => info.getValue() || '-',
          },
          {
            accessorKey: 'mecanisation',
            header: 'Mécanisation',
            cell: (info) => info.getValue() || '-',
          },
          {
            accessorKey: 'gnr',
            header: 'GNR',
            cell: (info) => info.getValue() || '-',
          },
          {
            accessorKey: 'irrigation',
            header: 'Irrigation',
            cell: (info) => info.getValue() || '-',
          },
          {
            accessorKey: 'totalCharges',
            header: 'Total charges',
            cell: (info) => info.getValue() || '-',
          },
          {
            accessorKey: 'prixVente',
            header: 'Prix de vente',
            cell: (info) => info.getValue() || '-',
          },
          {
            accessorKey: 'margeBrute',
            header: 'Marge brute',
            cell: (info) => info.getValue() || '-',
          },
        ],
      },
    ],
    []
  );

  const table = useReactTable({
    data: interventionsData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (!systemData) {
    return (
      <div className="interventions-table-container">
        <p className="no-data">Aucune donnée système disponible</p>
      </div>
    );
  }

  return (
    <div className="interventions-table-container">
      <div className="table-wrapper">
        <table className="interventions-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className={headerGroup.depth === 0 ? 'group-header-row' : ''}>
                {headerGroup.headers.map((header) => (
                  <th 
                    key={header.id}
                    colSpan={header.colSpan}
                    className={header.depth === 0 && header.colSpan > 1 ? 'group-header' : ''}
                    style={{
                      width: header.getSize() > 0 ? header.getSize() : 'auto'
                      
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'sortable-header'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td 
                    key={cell.id}
                    style={{
                      width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined,
                      maxWidth: cell.column.columnDef.maxSize,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {interventionsData.length === 0 && (
        <div className="no-data">Aucune intervention trouvée</div>
      )}
    </div>
  );
}
