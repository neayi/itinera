'use client';

import { useState, useEffect, useRef } from 'react';

interface EditableDateCellProps {
  value: string;
  stepIndex: number;
  interventionIndex: number;
  systemId: string;
  systemData: any;
  onUpdate?: (updatedSystemData?: any) => void;
}

export function EditableDateCell({ 
  value, 
  stepIndex, 
  interventionIndex, 
  systemId,
  systemData,
  onUpdate 
}: EditableDateCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (interventionIndex === -1) return; // Ne pas éditer les lignes de total
    
    // Convertir la date affichée (dd/mm/yyyy) en format ISO (yyyy-mm-dd) pour l'input
    if (value && value !== '-') {
      const parts = value.split('/');
      if (parts.length === 3) {
        const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        setEditValue(isoDate);
      }
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editValue || isSaving) return;

    setIsSaving(true);
    try {
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

      console.log('Storing system data');

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
        throw new Error('Failed to update intervention date');
      }

      // Recharger les données depuis l'API
      if (onUpdate) {
        onUpdate();
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving date:', error);
      alert('Erreur lors de la sauvegarde de la date');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
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
      <div className="editable-date-cell" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
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
    <span
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        padding: '0.25rem',
        borderRadius: '4px',
        display: 'inline-block',
        minWidth: '80px',
      }}
      className="hover:bg-gray-100"
    >
      {value || '-'}
    </span>
  );
}
