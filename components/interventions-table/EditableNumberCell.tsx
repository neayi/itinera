'use client';

import { useState, useEffect, useRef } from 'react';
import { formatValue, FieldKey } from './formatters';

interface EditableNumberCellProps {
  value: number | string;
  stepIndex: number;
  interventionIndex: number;
  systemId: string;
  systemData: any;
  fieldKey: FieldKey;
  reviewed?: boolean | 'n/a';
  onUpdate?: (updatedSystemData: any) => void;
}

export function EditableNumberCell({ 
  value, 
  stepIndex, 
  interventionIndex, 
  systemId,
  systemData,
  fieldKey,
  reviewed,
  onUpdate 
}: EditableNumberCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');
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
    setEditValue(value?.toString() || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(value?.toString() || '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    const numValue = parseFloat(editValue);
    
    // Vérifier si la valeur est valide
    if (editValue !== '' && isNaN(numValue)) {
      alert('Veuillez entrer un nombre valide');
      return;
    }

    const finalValue = editValue === '' ? 0 : numValue;

    // Même si la valeur n'a pas changé, on doit sauvegarder pour mettre reviewed = true
    const valueChanged = finalValue !== value;

    setIsSaving(true);
    try {
      // Créer une copie des données système
      const updatedSystemData = JSON.parse(JSON.stringify(systemData));
      
      const intervention = updatedSystemData.steps[stepIndex].interventions[interventionIndex];
      
      // S'assurer que le tableau values existe
      if (!intervention.values) {
        intervention.values = [];
      }
      
      // Chercher si la clé existe déjà
      const existingIndex = intervention.values.findIndex((v: any) => v.key === fieldKey);
      
      if (existingIndex >= 0) {
        // Mettre à jour la valeur existante
        intervention.values[existingIndex].value = finalValue;
        intervention.values[existingIndex].reviewed = true;
      } else {
        // Ajouter une nouvelle entrée
        intervention.values.push({ key: fieldKey, value: finalValue, reviewed: true });
      }

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
        throw new Error('Failed to update intervention value');
      }

      // Notifier le parent du changement
      if (onUpdate) {
        onUpdate(updatedSystemData);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving value:', error);
      alert('Erreur lors de la sauvegarde de la valeur');
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
    // Pour les lignes de totaux, afficher le total
    return <span>{typeof value === 'number' ? value.toFixed(2) : value || '-'}</span>;
  }

  if (isEditing) {
    return (
      <div className="editable-number-cell" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', width: '100%' }}>
        <input
          ref={inputRef}
          type="number"
          step="any"
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
            textAlign: 'right',
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

  // Déterminer si la cellule doit avoir un fond jaune
  const needsReview = reviewed !== true && reviewed !== 'n/a';

  return (
    <span
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        display: 'block',
        padding: '0.25rem 0',
        minHeight: '1.5rem',
        borderRadius: '0.25rem',
      }}
      className={needsReview ? 'needsReview' : ''}
      title={needsReview ? "Valeur à vérifier (cliquer pour éditer)" : "Cliquer pour éditer"}
    >
      {formatValue(value, fieldKey)}
    </span>
  );
}
