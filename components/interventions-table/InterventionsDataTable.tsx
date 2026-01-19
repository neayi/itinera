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
import { IndicatorFactory, type FieldKey } from '@/lib/ai/indicators';
import { calculateStepTotals } from '@/lib/calculate-system-totals';
import { EditableTextAreaCell } from './EditableTextAreaCell';
import { EditableNumberCell } from './EditableNumberCell';
import { EditableStepValueCell } from './EditableStepValueCell';
import './interventions-table.scss';

export function InterventionsDataTable({ 
  systemData, 
  systemId, 
  onUpdate,
  onCellFocus 
}: InterventionsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Fonction utilitaire pour extraire une valeur via l'indicateur
  const getValueFromIntervention = (stepIndex: number, interventionIndex: number, key: string): number => {
    try {
      const indicator = IndicatorFactory.create(key as FieldKey, {
        systemData,
        stepIndex,
        interventionIndex
      });

      const value = indicator.getRawValue();

      if (value === null)
        return 0;

      return value;
    } catch (e) {
      return 0;
    }
  };

  // Liste des indicateurs éditables au niveau de l'étape
  const stepLevelEditableFields = ['irrigation', 'rendementTMS', 'prixVente', 'totalProduits'];

  // Extraire les interventions de systemData
  const interventionsData = useMemo(() => {
    if (!systemData?.steps) return [];

    const rows: InterventionRow[] = [];
    
    systemData.steps.forEach((step: any, stepIndex: number) => {
      // Calculer les totaux pour ce step en utilisant la fonction centralisée
      const stepTotals = calculateStepTotals(systemData, stepIndex);

      // Ajouter la ligne de total pour ce step avec les valeurs calculées
      rows.push({
        id: `step-total-${stepIndex}`,
        stepIndex,
        interventionIndex: -1, // Indicateur pour ligne de total
        name: step.name || `Step ${stepIndex + 1}`,
        description: '',
        date: '',
        frequence: 0, // Pas de total de fréquence
        azoteMineral: stepTotals.azoteMineral,
        azoteOrganique: stepTotals.azoteOrganique,
        rendementTMS: stepTotals.rendementTMS,
        ift: stepTotals.ift,
        eiq: stepTotals.eiq,
        ges: stepTotals.ges,
        tempsTravail: stepTotals.tempsTravail,
        coutsPhytos: stepTotals.coutsPhytos,
        semences: stepTotals.semences,
        engrais: stepTotals.engrais,
        mecanisation: stepTotals.mecanisation,
        gnr: stepTotals.gnr,
        irrigation: stepTotals.irrigation,
        totalProduits: stepTotals.totalProduits,
        totalCharges: stepTotals.totalCharges,
        prixVente: stepTotals.prixVente,
        margeBrute: stepTotals.margeBrute,
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
            date: dateStr,
            frequence: getValueFromIntervention(stepIndex, interventionIndex, 'frequence') || 1, // Fréquence par défaut = 1
            azoteMineral: getValueFromIntervention(stepIndex, interventionIndex, 'azoteMineral'),
            azoteOrganique: getValueFromIntervention(stepIndex, interventionIndex, 'azoteOrganique'),
            rendementTMS: getValueFromIntervention(stepIndex, interventionIndex, 'rendementTMS'),
            ift: getValueFromIntervention(stepIndex, interventionIndex, 'ift'),
            eiq: getValueFromIntervention(stepIndex, interventionIndex, 'eiq'),
            ges: getValueFromIntervention(stepIndex, interventionIndex, 'ges'),
            tempsTravail: getValueFromIntervention(stepIndex, interventionIndex, 'tempsTravail'),
            coutsPhytos: getValueFromIntervention(stepIndex, interventionIndex, 'coutsPhytos'),
            semences: getValueFromIntervention(stepIndex, interventionIndex, 'semences'),
            engrais: getValueFromIntervention(stepIndex, interventionIndex, 'engrais'),
            mecanisation: getValueFromIntervention(stepIndex, interventionIndex, 'mecanisation'),
            gnr: getValueFromIntervention(stepIndex, interventionIndex, 'gnr'),
            irrigation: getValueFromIntervention(stepIndex, interventionIndex, 'irrigation'),
            totalProduits: 0, // totalProduits n'existe qu'au niveau de l'étape
            totalCharges: getValueFromIntervention(stepIndex, interventionIndex, 'totalCharges'),
            prixVente: getValueFromIntervention(stepIndex, interventionIndex, 'prixVente'),
            margeBrute: getValueFromIntervention(stepIndex, interventionIndex, 'margeBrute'),
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

                    if (header.column.parent.columns.at(0)?.id === header.column.id) {
                      groupClass += ' sub-header-start';
                    }

                    if (header.column.parent.columns.at(-1)?.id === header.column.id) {
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
                  // Récupérer le statut confidence et status pour les cellules numériques éditables
                  let confidenceLevel: 'high' | 'medium' | 'low' | undefined = undefined;
                  let valueStatus: 'user' | 'calculated' | 'ia' | 'n/a' | undefined = undefined;
                  
                  // Pour les cellules intervention-level
                  if ((cell.column.columnDef.meta as any)?.fieldType === 'number' && !row.original.isStepTotal) {
                    const intervention = systemData.steps[row.original.stepIndex]?.interventions[row.original.interventionIndex];
                    if (intervention) {
                      const valueEntry = intervention.values?.find((v: any) => v.key === cell.column.id);
                      if (valueEntry?.confidence) {
                        confidenceLevel = valueEntry.confidence;
                      }
                      if (valueEntry?.status) {
                        valueStatus = valueEntry.status;
                      }
                    }
                  }
                  
                  // Pour les cellules step-level (totaux)
                  if (row.original.isStepTotal && stepLevelEditableFields.includes(cell.column.id)) {
                    const step = systemData.steps[row.original.stepIndex];
                    if (step) {
                      const valueEntry = step.values?.find((v: any) => v.key === cell.column.id);
                      if (valueEntry?.confidence) {
                        confidenceLevel = valueEntry.confidence;
                      }
                      if (valueEntry?.status) {
                        valueStatus = valueEntry.status;
                      }
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
                    {row.original.isStepTotal && (cell.column.columnDef.meta as any)?.fieldType === 'number' ? (
                      // Pour les lignes de totaux, utiliser EditableStepValueCell pour tous les champs numériques
                      <EditableStepValueCell
                        value={cell.getValue() as number}
                        stepIndex={row.original.stepIndex}
                        systemId={systemId}
                        systemData={systemData}
                        fieldKey={cell.column.id as any}
                        status={valueStatus}
                        confidence={confidenceLevel}
                        onUpdate={onUpdate}
                      />
                    ) : (cell.column.columnDef.meta as any)?.editable && !row.original.isStepTotal ? (
                      (cell.column.columnDef.meta as any)?.fieldType === 'number' ? (
                        <EditableNumberCell
                          value={cell.getValue() as number}
                          stepIndex={row.original.stepIndex}
                          interventionIndex={row.original.interventionIndex}
                          systemId={systemId}
                          systemData={systemData}
                          fieldKey={cell.column.id as any}
                          status={valueStatus}
                          confidence={confidenceLevel}
                          onUpdate={onUpdate}
                          onCellFocus={onCellFocus}
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
