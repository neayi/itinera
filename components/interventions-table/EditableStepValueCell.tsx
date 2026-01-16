'use client';

import { useState, useEffect, useRef } from 'react';
import { formatValue, FieldKey } from './formatters';

interface EditableStepValueCellProps {
  value: number;
  stepIndex: number;
  systemId: string;
  systemData: any;
  fieldKey: FieldKey;
  onUpdate?: (updatedSystemData?: any) => void;
}

export function EditableStepValueCell({ 
  value, 
  stepIndex, 
  systemId,
  systemData,
  fieldKey,
  onUpdate 
}: EditableStepValueCellProps) {
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

    setIsSaving(true);
    try {
      // Créer une copie des données système
      const updatedSystemData = JSON.parse(JSON.stringify(systemData));
      
      const step = updatedSystemData.steps[stepIndex];
      
      // S'assurer que le tableau values existe
      if (!step.values) {
        step.values = [];
      }
      
      // Chercher si la clé existe déjà
      const existingIndex = step.values.findIndex((v: any) => v.key === fieldKey);
      
      if (existingIndex >= 0) {
        // Mettre à jour la valeur existante
        step.values[existingIndex].value = finalValue;
      } else {
        // Ajouter une nouvelle entrée
        step.values.push({ key: fieldKey, value: finalValue });
      }

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
        throw new Error('Failed to update step value');
      }

      // Recharger les données depuis l'API pour obtenir les totaux recalculés
      if (onUpdate) {
        onUpdate();
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving step value:', error);
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
        <div style={{ display: 'flex', gap: '0.125rem' }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '0.125rem 0.375rem',
              fontSize: '0.75rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            ✓
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            style={{
              padding: '0.125rem 0.375rem',
              fontSize: '0.75rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: isSaving ? 'not-allowed' : 'pointer',
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
      style={{ cursor: 'pointer' }}
      title="Cliquer pour éditer la valeur au niveau de l'étape"
    >
      {formatValue(value, fieldKey)}
    </span>
  );
}
