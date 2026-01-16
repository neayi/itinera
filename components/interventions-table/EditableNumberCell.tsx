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
  confidence?: 'high' | 'medium' | 'low';
  onUpdate?: (updatedSystemData?: any) => void;
  onCellFocus?: (stepIndex: number, interventionIndex: number, indicatorKey: string) => void;
}

export function EditableNumberCell({ 
  value, 
  stepIndex, 
  interventionIndex, 
  systemId,
  systemData,
  fieldKey,
  reviewed,
  confidence,
  onUpdate,
  onCellFocus
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

  // Update editValue when value changes from AI calculation (while editing)
  useEffect(() => {
    if (isEditing && value !== undefined && value !== null) {
      setEditValue(value.toString());
    }
  }, [value, isEditing]);

  const handleClick = () => {
    if (interventionIndex === -1) return; // Pas d'édition pour les lignes de totaux
    
    // Open edit mode
    setEditValue(value?.toString() || '');
    setIsEditing(true);
    
    // Open AI Assistant for this cell
    if (onCellFocus) {
      onCellFocus(stepIndex, interventionIndex, fieldKey);
    }
  };

  const handleOpenAssistant = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher l'ouverture de l'éditeur
    if (onCellFocus) {
      onCellFocus(stepIndex, interventionIndex, fieldKey);
    }
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
      
      // Mettre à jour la valeur modifiée avec status='user'
      const idx = intervention.values.findIndex((v: any) => v.key === fieldKey);
      if (idx >= 0) {
        const oldValue = intervention.values[idx].value;
        intervention.values[idx].value = finalValue;
        intervention.values[idx].status = 'user';
        intervention.values[idx].reviewed = true;
        
        // If there's an existing conversation and the value changed, add a manual edit message
        if (intervention.values[idx].conversation && intervention.values[idx].conversation.length > 0 && valueChanged) {
          intervention.values[idx].conversation.push({
            role: 'user',
            content: `Modification manuelle : ${oldValue} → ${finalValue}`,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        intervention.values.push({ 
          key: fieldKey, 
          value: finalValue, 
          status: 'user',
          reviewed: true 
        });
      }

      // Note: totalCharges, totalProduits, margeBrute are now calculated automatically 
      // by calculateAndSaveSystemTotals() on the server after this PATCH

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

      // Recharger les données depuis l'API pour obtenir les totaux recalculés
      // L'API appelle calculateAndSaveSystemTotals qui met à jour intervention.values, step.values et systemValues
      if (onUpdate) {
        // Passer undefined pour forcer le rechargement depuis l'API
        onUpdate();
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

  // Check if cell is empty
  const isEmpty = !value || value === 0 || value === '0';

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

  // Show clickable span for empty cells (calculation now triggered from AI Assistant panel)
  if (isEmpty) {
    return (
      <span
        onClick={handleClick}
        style={{
          cursor: 'pointer',
          padding: '0.25rem 0',
          minHeight: '1.5rem',
          display: 'inline-block',
        }}
        title="Cliquer pour ouvrir l'assistant IA"
      >
        -
      </span>
    );
  }

  return (
    <span
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0',
        minHeight: '1.5rem',
        borderRadius: '0.25rem',
      }}
      className={needsReview ? 'needsReview' : ''}
      title={needsReview ? "Valeur à vérifier (cliquer pour éditer)" : "Cliquer pour éditer"}
    >
      <span style={{ flex: 1 }}>{formatValue(value, fieldKey)}</span>    
    </span>
  );
}
