'use client';

import { useState, useEffect, useRef } from 'react';

interface EditableTextCellProps {
  value: string;
  stepIndex: number;
  interventionIndex: number;
  systemId: string;
  systemData: any;
  fieldName: 'name' | 'description';
  onUpdate?: (updatedSystemData?: any) => void;
}

export function EditableTextCell({ 
  value, 
  stepIndex, 
  interventionIndex, 
  systemId,
  systemData,
  fieldName,
  onUpdate 
}: EditableTextCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
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
      
      // Mettre à jour le champ approprié
      updatedSystemData.steps[stepIndex].interventions[interventionIndex][fieldName] = editValue;

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
        throw new Error(`Failed to update intervention ${fieldName}`);
      }

      // Recharger les données depuis l'API
      if (onUpdate) {
        onUpdate();
      }
      setIsEditing(false);
    } catch (error) {
      console.error(`Error saving ${fieldName}:`, error);
      alert(`Erreur lors de la sauvegarde du ${fieldName === 'name' ? 'nom' : 'champ'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
      <div className="editable-text-cell" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', width: '100%' }}>
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
    <span
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        display: 'block',
        padding: '0.25rem 0',
        minHeight: '1.5rem',
      }}
      title="Cliquer pour éditer"
    >
      {value || '-'}
    </span>
  );
}
