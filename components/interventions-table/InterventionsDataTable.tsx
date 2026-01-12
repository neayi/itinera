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
import { EditableDateCell } from './EditableDateCell';
import { EditableTextCell } from './EditableTextCell';
import { EditableTextAreaCell } from './EditableTextAreaCell';
import { EditableNumberCell } from './EditableNumberCell';
import './interventions-table.scss';

export function InterventionsDataTable({ systemData, systemId, onUpdate }: InterventionsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Fonction utilitaire pour extraire une valeur du tableau values
  const getValueFromArray = (intervention: any, key: string): number => {
    if (!intervention.values || !Array.isArray(intervention.values)) return 0;
    const item = intervention.values.find((v: any) => v.key === key);
    return item ? (typeof item.value === 'number' ? item.value : 0) : 0;
  };

  // Fonction utilitaire pour récupérer le statut reviewed
  const getReviewedStatus = (intervention: any, key: string): boolean | 'n/a' | undefined => {
    if (!intervention.values || !Array.isArray(intervention.values)) return undefined;
    const item = intervention.values.find((v: any) => v.key === key);
    return item?.reviewed;
  };

  // Extraire les interventions de systemData
  const interventionsData = useMemo(() => {
    if (!systemData?.steps) return [];

    const rows: InterventionRow[] = [];
    
    systemData.steps.forEach((step: any, stepIndex: number) => {
      // Calculer les totaux pour ce step
      const stepTotals = {
        azoteMineral: 0,
        azoteOrganique: 0,
        rendementTMS: 0,
        ift: 0,
        eiq: 0,
        ges: 0,
        tempsTravail: 0,
        coutsPhytos: 0,
        semences: 0,
        engrais: 0,
        mecanisation: 0,
        gnr: 0,
        irrigation: 0,
        totalCharges: 0,
        prixVente: 0,
        margeBrute: 0,
      };

      // Calculer les totaux pondérés par la fréquence
      if (step.interventions && Array.isArray(step.interventions)) {
        step.interventions.forEach((intervention: any) => {
          const freq = getValueFromArray(intervention, 'frequence') || 1; // Fréquence par défaut = 1
          
          stepTotals.azoteMineral += getValueFromArray(intervention, 'azoteMineral') * freq;
          stepTotals.azoteOrganique += getValueFromArray(intervention, 'azoteOrganique') * freq;
          stepTotals.rendementTMS += getValueFromArray(intervention, 'rendementTMS') * freq;
          stepTotals.ift += getValueFromArray(intervention, 'ift') * freq;
          stepTotals.eiq += getValueFromArray(intervention, 'eiq') * freq;
          stepTotals.ges += getValueFromArray(intervention, 'ges') * freq;
          stepTotals.tempsTravail += getValueFromArray(intervention, 'tempsTravail') * freq;
          stepTotals.coutsPhytos += getValueFromArray(intervention, 'coutsPhytos') * freq;
          stepTotals.semences += getValueFromArray(intervention, 'semences') * freq;
          stepTotals.engrais += getValueFromArray(intervention, 'engrais') * freq;
          stepTotals.mecanisation += getValueFromArray(intervention, 'mecanisation') * freq;
          stepTotals.gnr += getValueFromArray(intervention, 'gnr') * freq;
          stepTotals.irrigation += getValueFromArray(intervention, 'irrigation') * freq;
          stepTotals.totalCharges += getValueFromArray(intervention, 'totalCharges') * freq;
          stepTotals.prixVente += getValueFromArray(intervention, 'prixVente') * freq;
          stepTotals.margeBrute += getValueFromArray(intervention, 'margeBrute') * freq;
        });
      }

      // Ajouter la ligne de total pour ce step avec les valeurs calculées
      rows.push({
        id: `step-total-${stepIndex}`,
        stepIndex,
        interventionIndex: -1, // Indicateur pour ligne de total
        name: step.name || `Step ${stepIndex + 1}`,
        description: '',
        produit: '',
        date: '',
        frequence: 0, // Pas de total de fréquence
        ...stepTotals,
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
            frequence: getValueFromArray(intervention, 'frequence') || 1, // Fréquence par défaut = 1
            azoteMineral: getValueFromArray(intervention, 'azoteMineral'),
            azoteOrganique: getValueFromArray(intervention, 'azoteOrganique'),
            rendementTMS: getValueFromArray(intervention, 'rendementTMS'),
            ift: getValueFromArray(intervention, 'ift'),
            eiq: getValueFromArray(intervention, 'eiq'),
            ges: getValueFromArray(intervention, 'ges'),
            tempsTravail: getValueFromArray(intervention, 'tempsTravail'),
            coutsPhytos: getValueFromArray(intervention, 'coutsPhytos'),
            semences: getValueFromArray(intervention, 'semences'),
            engrais: getValueFromArray(intervention, 'engrais'),
            mecanisation: getValueFromArray(intervention, 'mecanisation'),
            gnr: getValueFromArray(intervention, 'gnr'),
            irrigation: getValueFromArray(intervention, 'irrigation'),
            totalCharges: getValueFromArray(intervention, 'totalCharges'),
            prixVente: getValueFromArray(intervention, 'prixVente'),
            margeBrute: getValueFromArray(intervention, 'margeBrute'),
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
                {row.getVisibleCells().map((cell) => {
                  // Récupérer le statut reviewed pour les cellules numériques éditables
                  let reviewedStatus: boolean | 'n/a' | undefined = undefined;
                  if ((cell.column.columnDef.meta as any)?.fieldType === 'number' && !row.original.isStepTotal) {
                    const intervention = systemData.steps[row.original.stepIndex]?.interventions[row.original.interventionIndex];
                    if (intervention) {
                      reviewedStatus = getReviewedStatus(intervention, cell.column.id);
                    }
                  }

                  return (
                  <td 
                    key={cell.id}
                    style={{
                      width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined,
                      maxWidth: cell.column.columnDef.maxSize,
                      textAlign: (cell.column.columnDef.meta as any)?.align || 'left'
                    }}
                  >
                    {(cell.column.columnDef.meta as any)?.editable && !row.original.isStepTotal ? (
                      (cell.column.columnDef.meta as any)?.fieldType === 'number' ? (
                        <EditableNumberCell
                          value={cell.getValue() as number}
                          stepIndex={row.original.stepIndex}
                          interventionIndex={row.original.interventionIndex}
                          systemId={systemId}
                          systemData={systemData}
                          fieldKey={cell.column.id as any}
                          reviewed={reviewedStatus}
                          onUpdate={onUpdate}
                        />
                      ) : cell.column.id === 'date' ? (
                        <EditableDateCell
                          value={cell.getValue() as string}
                          stepIndex={row.original.stepIndex}
                          interventionIndex={row.original.interventionIndex}
                          systemId={systemId}
                          systemData={systemData}
                          onUpdate={onUpdate}
                        />
                      ) : cell.column.id === 'description' ? (
                        <EditableTextAreaCell
                          value={cell.getValue() as string}
                          stepIndex={row.original.stepIndex}
                          interventionIndex={row.original.interventionIndex}
                          systemId={systemId}
                          systemData={systemData}
                          onUpdate={onUpdate}
                        />
                      ) : cell.column.id === 'name' ? (
                        <EditableTextCell
                          value={cell.getValue() as string}
                          stepIndex={row.original.stepIndex}
                          interventionIndex={row.original.interventionIndex}
                          systemId={systemId}
                          systemData={systemData}
                          fieldName="name"
                          onUpdate={onUpdate}
                        />
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </td>
                  );
                })}
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
