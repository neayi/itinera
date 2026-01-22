'use client';

import { useState, useEffect, useRef } from 'react';

interface EditableDateCellProps {
  value: string;
  stepIndex: number;
  interventionIndex: number;
  systemData: any;
  triggerSave: (systemData: any) => void;
  onRequestEdit?: (startEdit: () => void) => void;
  tdRef?: React.RefObject<HTMLTableCellElement>;
  cellId: string;
  isEditing: boolean;
  onEditingChange: (cellId: string | null) => void;
}

export function EditableDateCell({
  value,
  stepIndex,
  interventionIndex,
  systemData,
  triggerSave,
  onRequestEdit,
  tdRef,
  cellId,
  isEditing,
  onEditingChange
}: EditableDateCellProps) {
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startEditing = () => {
    if (interventionIndex === -1) return;
    // Convertir la date affichée (dd/mm/yyyy) en format ISO (yyyy-mm-dd) pour l'input
    if (value && value !== '-') {
      const parts = value.split('/');
      if (parts.length === 3) {
        const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        setEditValue(isoDate);
      }
    }
    onEditingChange(cellId);
  };

  useEffect(() => {
    if (onRequestEdit) {
      onRequestEdit(startEditing);
    }
  }, [onRequestEdit]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (!editValue || isSaving) return;

    setIsSaving(true);

    // Calculer le nouveau day basé sur la nouvelle date et la startDate du step
    const newDate = new Date(editValue);
    const step = systemData.steps[stepIndex];
    const startDate = new Date(step.startDate);

    // Calculer la différence en jours
    const diffTime = newDate.getTime() - startDate.getTime();
    const newDay = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Créer une copie du systemData et mettre à jour le day
    const updatedSystemData = JSON.parse(JSON.stringify(systemData));
    updatedSystemData.steps[stepIndex].interventions[interventionIndex].day = newDay;

    // Sauvegarder avec debounce
    triggerSave(updatedSystemData);

    onEditingChange(null);
    setIsSaving(false);
  };

  const handleCancel = () => {
    onEditingChange(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (interventionIndex === -1) {
    return <span>{value || '-'}</span>;
  }

  if (isEditing) {
    return (
      <div ref={containerRef} className="editable-date-cell" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', width: '100%' }} onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="date"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          style={{
            padding: '0.25rem',
            fontSize: '0.875rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
          }}
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? '...' : '✓'}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="editable-cell">
      <span>
        {value || '-'}
      </span>
    </div>
  );
}
