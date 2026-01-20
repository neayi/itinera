'use client';

import { useState, useEffect, useRef } from 'react';

interface EditableTextAreaCellProps {
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

export function EditableTextAreaCell({
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
}: EditableTextAreaCellProps) {
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startEditing = () => {
    if (interventionIndex === -1) return;
    setEditValue(value || '');
    onEditingChange(cellId);
    // Scroller vers la cellule
    setTimeout(() => {
      if (tdRef?.current) {
        tdRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  useEffect(() => {
    if (onRequestEdit) {
      onRequestEdit(startEditing);
    }
  }, [onRequestEdit]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleCancel = () => {
    setEditValue(value || '');
    onEditingChange(null);
  };

  const handleSave = async () => {
    if (editValue === value) {
      onEditingChange(null);
      return;
    }

    setIsSaving(true);
    try {
      // Créer une copie des données système
      const updatedSystemData = JSON.parse(JSON.stringify(systemData));

      // Mettre à jour la description
      updatedSystemData.steps[stepIndex].interventions[interventionIndex].description = editValue;

      // Sauvegarder avec debounce
      triggerSave(updatedSystemData);

      onEditingChange(null);
    } catch (error) {
      console.error('Error saving description:', error);
      alert('Erreur lors de la sauvegarde de la description');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
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
      <div className="editable-textarea-cell" style={{ display: 'flex', gap: '0.25rem', alignItems: 'flex-start', width: '100%' }} onClick={(e) => e.stopPropagation()}>
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          rows={3}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.875rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.25rem',
            flex: 1,
            minWidth: 0,
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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
            title="Ctrl+Enter pour enregistrer"
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
      </div>
    );
  }

  return (
    <div className="editable-cell">
      <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {value || '-'}
      </span>
    </div>
  );
}
