'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { calculateSystemTotals } from '@/lib/calculate-system-totals';
import type { ValueStatus, ConfidenceLevel } from '@/lib/types';
import { IndicatorFactory, type FieldKey } from '@/lib/ai/indicators';

/**
 * T006: Determine CSS class based on status and confidence
 * Returns appropriate class name for visual indication of cell source
 */
function getCellClassName(status?: ValueStatus, confidence?: ConfidenceLevel): string {
  if (status === 'n/a') {
    return 'status-na';
  }
  if (status === 'ia') {
    if (confidence === 'high') return 'status-ia-high';
    if (confidence === 'medium') return 'status-ia-medium';
    if (confidence === 'low') return 'status-ia-low';
    // Fallback for IA without confidence
    return 'status-ia-medium';
  }
  // For 'user', 'calculated', or undefined: no special class (white background)
  return '';
}

interface EditableNumberCellProps {
  value: number | string;
  stepIndex: number;
  interventionIndex: number;
  systemId: string;
  systemData: any;
  fieldKey: FieldKey;
  status?: ValueStatus;
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
  status,
  confidence,
  onUpdate,
  onCellFocus
}: EditableNumberCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // T006: Get CSS class based on status and confidence
  const cellClassName = getCellClassName(status, confidence);

  // Create indicator instance for formatting
  const indicator = useMemo(() => {
    return IndicatorFactory.create(fieldKey, {
      systemData,
      stepIndex,
      interventionIndex
    });
  }, [fieldKey, systemData, stepIndex, interventionIndex]);

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
    
    // Open edit mode immediately (synchronous)
    setEditValue(value?.toString() || '');
    setIsEditing(true);
    
    // Open AI Assistant asynchronously after editor is rendered
    if (onCellFocus) {
      setTimeout(() => {
        onCellFocus(stepIndex, interventionIndex, fieldKey);
      }, 0);
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
          status: 'user'
        });
      }

      // Update UI immediately with calculated data (no server round-trip)
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
      className={cellClassName}
      title="Cliquer pour éditer"
    >
      <span style={{ flex: 1 }}>{indicator.getFormattedValue()}</span>    
    </span>
  );
}
