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
      const step = updatedSystemData.steps[stepIndex];
      
      // S'assurer que le tableau values existe
      if (!intervention.values) {
        intervention.values = [];
      }
      
      // Fonction utilitaire pour récupérer une valeur
      const getValue = (key: string): number => {
        const item = intervention.values.find((v: any) => v.key === key);
        return item ? (typeof item.value === 'number' ? item.value : 0) : 0;
      };
      
      // Fonction utilitaire pour mettre à jour ou ajouter une valeur
      const setValue = (key: string, value: number, reviewed: boolean = true) => {
        const idx = intervention.values.findIndex((v: any) => v.key === key);
        if (idx >= 0) {
          intervention.values[idx].value = value;
          intervention.values[idx].reviewed = reviewed;
        } else {
          intervention.values.push({ key, value, reviewed });
        }
      };
      
      // Mettre à jour la valeur modifiée
      setValue(fieldKey, finalValue, true);
      
      // Si on modifie un des composants de totalCharges, recalculer totalCharges
      const totalChargesComponents = ['coutsPhytos', 'semences', 'engrais', 'mecanisation', 'gnr', 'irrigation'];
      if (totalChargesComponents.includes(fieldKey)) {
        const newTotalCharges = 
          getValue('coutsPhytos') +
          getValue('semences') +
          getValue('engrais') +
          getValue('mecanisation') +
          getValue('gnr') +
          getValue('irrigation');
        
        setValue('totalCharges', newTotalCharges, false);
      }

      // Si ce champ est éditable au niveau de l'étape (irrigation, rendementTMS, prixVente),
      // supprimer la valeur au niveau de l'étape pour restaurer le calcul par somme pondérée
      const stepLevelEditableFields = ['irrigation', 'rendementTMS', 'prixVente'];
      if (stepLevelEditableFields.includes(fieldKey)) {
        if (step.stepValues && Array.isArray(step.stepValues)) {
          const stepValueIndex = step.stepValues.findIndex((v: any) => v.key === fieldKey);
          if (stepValueIndex >= 0) {
            // Supprimer la valeur au niveau de l'étape
            step.stepValues.splice(stepValueIndex, 1);
          }
        }
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
