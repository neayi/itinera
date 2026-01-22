'use client';

import { useState, useEffect, useRef } from 'react';

interface EditableTextCellProps {
  value: string;
  stepIndex: number;
  interventionIndex: number;
  systemData: any;
  fieldName: 'name' | 'description';
  triggerSave: (systemData: any) => void;
  onRequestEdit?: (startEdit: () => void) => void;
  cellId: string;
  isEditing: boolean;
  onEditingChange: (cellId: string | null) => void;
}

export function EditableTextCell({
  value,
  stepIndex,
  interventionIndex,
  systemData,
  fieldName,
  triggerSave,
  onRequestEdit,
  cellId,
  isEditing,
  onEditingChange
}: EditableTextCellProps) {
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startEditing = () => {
    if (interventionIndex === -1) return;
    setEditValue(value || '');
    onEditingChange(cellId);
  };

  // Passer la fonction startEditing au parent
  useEffect(() => {
    if (onRequestEdit) {
      onRequestEdit(startEditing);
    }
  }, [onRequestEdit]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleCancel = () => {
    setEditValue(value || '');
    onEditingChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSave = () => {
    if (editValue === value) {
      onEditingChange(null);
      return;
    }

    setIsSaving(true);

    // Créer une copie des données système
    const updatedSystemData = JSON.parse(JSON.stringify(systemData));

    // Mettre à jour le champ approprié
    updatedSystemData.steps[stepIndex].interventions[interventionIndex][fieldName] = editValue;

    // Sauvegarder avec debounce
    triggerSave(updatedSystemData);

    handleCancel();
    setIsSaving(false);
  };

  if (interventionIndex === -1) {
    return <span>{value || '-'}</span>;
  }

  if (isEditing) {
    return (
      <div ref={containerRef} className="editable-text-cell" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', width: '100%' }} onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.875rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.25rem',
            flex: 1,
            minWidth: 0,
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
            borderRadius: '0.25rem',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.6 : 1,
            whiteSpace: 'nowrap',
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
            borderRadius: '0.25rem',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.6 : 1,
            whiteSpace: 'nowrap',
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
