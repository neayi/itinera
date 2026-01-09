'use client';

import { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import { InterventionRow, InterventionsDataTableProps } from './types';
import { interventionColumns } from './columns';
import './interventions-table.scss';

export function InterventionsDataTable({ systemData }: InterventionsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Extraire les interventions de systemData
  const interventionsData = useMemo(() => {
    if (!systemData?.steps) return [];

    const rows: InterventionRow[] = [];
    
    systemData.steps.forEach((step: any, stepIndex: number) => {
      // Ajouter d'abord la ligne de total pour ce step
      rows.push({
        id: `step-total-${stepIndex}`,
        stepIndex,
        interventionIndex: -1, // Indicateur pour ligne de total
        name: step.name || `Step ${stepIndex + 1}`,
        description: '',
        produit: '',
        date: '',
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
        isStepTotal: true,
        stepName: step.name || `Step ${stepIndex + 1}`,
      });

      // Puis ajouter les interventions
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
            isStepTotal: false,
          });
        });
      }
    });

    return rows;
  }, [systemData]);

  const table = useReactTable({
    data: interventionsData,
    columns: interventionColumns,
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
                {headerGroup.headers.map((header) => {
                  // Déterminer la classe de groupe pour les en-têtes
                  let groupClass = 'group-header';
                  if (header.column.id === 'agronomie' || header.column.parent?.id === 'agronomie') groupClass += ' group-agronomie';
                  else if (header.column.id === 'environnemental' || header.column.parent?.id === 'environnemental') groupClass += ' group-environnemental';
                  else if (header.column.id === 'economique' || header.column.parent?.id === 'economique') groupClass += ' group-economique';
                  
                  if (header.column.parent != undefined) {
                    groupClass += ' sub-header';

                    if (header.column.parent.columns.at(0).id === header.column.id) {
                      groupClass += ' sub-header-start';
                    }

                    if (header.column.parent.columns.at(-1).id === header.column.id) {
                      groupClass += ' sub-header-end';
                    }
                  }

                  return (
                  <th 
                    key={header.id}
                    colSpan={header.colSpan}
                    className={groupClass}
                    style={{
                      width: header.getSize() > 0 ? header.getSize() : 'auto',
                      textAlign: (header.column.columnDef.meta as any)?.align || 'left'
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
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id}
                className={row.original.isStepTotal ? 'step-total-row' : ''}
              >
                {row.getVisibleCells().map((cell) => (
                  <td 
                    key={cell.id}
                    style={{
                      width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined,
                      maxWidth: cell.column.columnDef.maxSize,
                      textAlign: (cell.column.columnDef.meta as any)?.align || 'left'
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
