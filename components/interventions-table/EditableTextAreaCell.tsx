'use client';

import { useState, useEffect, useRef } from 'react';

interface EditableTextAreaCellProps {
  value: string;
  stepIndex: number;
  interventionIndex: number;
  systemId: string;
  systemData: any;
  onUpdate?: (updatedSystemData: any) => void;
}

export function EditableTextAreaCell({ 
  value, 
  stepIndex, 
  interventionIndex, 
  systemId,
  systemData,
  onUpdate 
}: EditableTextAreaCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (interventionIndex === -1) return; // Pas d'édition pour les lignes de totaux
    setEditValue(value || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      // Créer une copie des données système
      const updatedSystemData = JSON.parse(JSON.stringify(systemData));
      
      // Mettre à jour la description
      updatedSystemData.steps[stepIndex].interventions[interventionIndex].description = editValue;

      // Envoyer la mise à jour à l'API
      const response = await fetch(`/api/systems/${systemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          json: updatedSystemData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update intervention description');
      }

      // Notifier le parent du changement
      if (onUpdate) {
        onUpdate(updatedSystemData);
      }
      setIsEditing(false);
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
      <div className="editable-textarea-cell" style={{ display: 'flex', gap: '0.25rem', alignItems: 'flex-start', width: '100%' }}>
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
    <span
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        display: 'block',
        padding: '0.25rem 0',
        minHeight: '1.5rem',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
      title="Cliquer pour éditer (Ctrl+Enter pour sauvegarder)"
    >
      {value || '-'}
    </span>
  );
}
