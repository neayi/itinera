'use client';

import { IndicatorFactory } from '@/lib/ai/indicators';

interface CalculationProgressProps {
  current: number;
  total: number;
  currentIndicator?: string;
  stepName?: string;
  interventionName?: string;
  onCancel?: () => void;
  isComplete?: boolean;
}

export default function CalculationProgress({
  current,
  total,
  currentIndicator,
  stepName,
  interventionName,
  onCancel,
  isComplete = false,
}: CalculationProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  // If total is 0, we're waiting for the server response
  const isWaiting = total === 0;

  return (
    <div className="calculation-progress" style={{ padding: '1rem' }}>
      <div className="progress-header">
        <h4 className="progress-title" style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          {isComplete ? '✅ Calcul terminé' : isWaiting ? '⏳ Détection des indicateurs...' : '⏳ Calcul en cours...'}
        </h4>
        {!isWaiting && (
          <div className="progress-stats" style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            {current} / {total} indicateurs
          </div>
        )}
        {isWaiting && (
          <div className="progress-stats" style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Analyse du système en cours...
          </div>
        )}
      </div>

      {currentIndicator && !isComplete && !isWaiting && (
        <div className="current-indicator" style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#374151' }}>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>{stepName}</strong> → {interventionName}
          </div>
          <div>
            En cours : <strong>{IndicatorFactory.create(currentIndicator).getLabel()}</strong>
          </div>
        </div>
      )}

      {!isWaiting && (
        <>
          <div className="progress-bar-container" style={{
            width: '100%',
            height: '0.5rem',
            backgroundColor: '#e5e7eb',
            borderRadius: '0.25rem',
            overflow: 'hidden',
            marginBottom: '0.5rem',
          }}>
            <div
              className="progress-bar-fill"
              style={{
                height: '100%',
                width: `${percentage}%`,
                backgroundColor: isComplete ? '#10b981' : '#3b82f6',
                transition: 'width 0.3s ease-in-out',
              }}
            />
          </div>

          <div className="progress-percentage" style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            {percentage}%
          </div>
        </>
      )}

      {isComplete && (
        <div className="completion-summary" style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f0fdf4',
          borderRadius: '0.5rem',
          border: '1px solid #86efac',
        }}>
          <p style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.5rem' }}>
            ✨ Le calcul en lot est terminé avec succès !
          </p>
          <p style={{ fontSize: '0.75rem', color: '#16a34a' }}>
            Les valeurs calculées apparaissent dans le tableau avec un badge de confiance.
            Vous pouvez cliquer sur une cellule pour affiner les résultats via le dialogue.
          </p>
        </div>
      )}

      {!isComplete && onCancel && (
        <button
          onClick={onCancel}
          className="cancel-button"
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Annuler
        </button>
      )}
    </div>
  );
}
