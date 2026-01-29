'use client';

import { useState, useEffect } from 'react';
import { ConversationMessage } from '@/shared/ai/ai.dto';
import { IndicatorFactory } from '@/lib/ai/indicators';
import ConversationHistory from './ConversationHistory';
import MessageInput from './MessageInput';
import AssumptionsPanel from './AssumptionsPanel';
import CalculationProgress from './CalculationProgress';
import './ai-assistant.scss';
import { Sparkles, ChevronRight } from 'lucide-react';

interface AIAssistantProps {
  isOpen: boolean;
  focusedCell?: {
    stepIndex: number;
    interventionIndex: number;
    indicatorKey: string;
  };
  systemData: any;
  systemId: string;
  onClose: () => void;
  onValueUpdate?: (updatedSystemData: any) => void;
  onCalculate?: () => Promise<void>;
  batchProgress?: {
    current: number;
    total: number;
    currentIndicator: string;
    stepName?: string;
    interventionName?: string;
  };
  isBatchCalculating?: boolean;
  onCancelBatch?: () => void;
  isBatchPrepared?: boolean;
  batchEstimation?: {
    indicatorsWithoutValue: number;
    totalCalculableIndicators: number;
    estimatedSeconds: number;
    estimatedSecondsAll: number;
  } | null;
  onStartCalculation?: () => void;
  recalculateAll?: boolean;
  onRecalculateAllChange?: (value: boolean) => void;
}

export default function AIAssistant({
  isOpen,
  focusedCell,
  systemData,
  systemId,
  onClose,
  onValueUpdate,
  onCalculate,
  batchProgress,
  isBatchCalculating = false,
  onCancelBatch,
  isBatchPrepared = false,
  batchEstimation = null,
  onStartCalculation,
  recalculateAll = false,
  onRecalculateAllChange,
}: AIAssistantProps) {
  const [isRefining, setIsRefining] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Scroller vers la cellule éditée quand l'assistant s'ouvre
  useEffect(() => {
    if (isOpen && focusedCell) {
      // Attendre que la transition CSS soit terminée (0.3s) + un peu de marge
      setTimeout(() => {
        // Trouver le premier TD contenant une div avec une classe editable
        const editableClasses = [
          'editable-number-cell',
          'editable-text-cell',
          'editable-textarea-cell',
          'editable-date-cell'
        ];

        for (const className of editableClasses) {
          const editableDiv = document.querySelector(`.${className}`);
          if (editableDiv) {
            const td = editableDiv.closest('td');
            if (td) {
              td.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
              });
              break;
            }
          }
        }
      }, 400); // 300ms transition + 100ms marge
    }
  }, [isOpen, focusedCell]);

  // Helper function to format estimated time
  const formatEstimatedTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)} seconde${seconds > 1 ? 's' : ''}`;
    } else if (seconds < 3600) {
      const minutes = Math.round(seconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.round((seconds % 3600) / 60);
      if (minutes > 0) {
        return `${hours} heure${hours > 1 ? 's' : ''} et ${minutes} minute${minutes > 1 ? 's' : ''}`;
      }
      return `${hours} heure${hours > 1 ? 's' : ''}`;
    }
  };

  if (!isOpen) {
    return null;
  }

  // Extract conversation from system data if focusedCell exists
  let step, intervention, valueEntry, conversation;
  if (focusedCell) {
    step = systemData?.steps?.[focusedCell.stepIndex];
    intervention = step?.interventions?.[focusedCell.interventionIndex];
    valueEntry = intervention?.values?.find((v: any) => v.key === focusedCell.indicatorKey);
    conversation = valueEntry?.conversation || [];
  }

  const handleSendMessage = async (message: string) => {
    if (!focusedCell) return;

    setIsRefining(true);
    try {
      const response = await fetch('/api/ai/refine-value', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemId,
          stepIndex: focusedCell.stepIndex,
          interventionIndex: focusedCell.interventionIndex,
          indicatorKey: focusedCell.indicatorKey,
          userMessage: message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to refine value');
      }

      const result = await response.json();

      // Notify parent of the update
      if (onValueUpdate && result.updatedSystemData) {
        onValueUpdate(result.updatedSystemData);
      }

    } catch (error: any) {
      console.error('Error refining value:', error);
      alert(`Erreur lors du raffinement: ${error.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <aside
      className="ai-assistant"
      data-ai-assistant="true"
    >
      {/* Header */}
      <div className="header">
        <div className="header-content">
          {/* Sparkle icon */}
          <div className="icon">
            <Sparkles className="size-4" />
          </div>
          <h3 className="title">
            {focusedCell ? `Assistant IA - ${IndicatorFactory.create(focusedCell.indicatorKey).getLabel()}` : 'Assistant de simulation'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="close-btn"
          title="Replier le panneau"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Context Banner - only show if there's a focused cell */}
      {focusedCell && intervention && (
        <div className="context-banner">
          <div className="context-title">
            <span className="context-name">{intervention.name}</span>
            {intervention.description && (
              <span className="context-description"> · {intervention.description}</span>
            )}
          </div>
          <div className="context-step">
            Étape: {step?.name}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="messages">
        {isBatchPrepared && batchEstimation && !isBatchCalculating ? (
          <div className="messages-container">
            <div className="empty-card" style={{ backgroundColor: '#f0f9ff', border: '1px solid #3b82f6' }}>
              <div className="empty-content">
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e40af' }}>
                  Calcul prêt à démarrer
                </h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                    <strong>{recalculateAll ? batchEstimation.totalCalculableIndicators : batchEstimation.indicatorsWithoutValue}</strong> indicateur{(recalculateAll ? batchEstimation.totalCalculableIndicators : batchEstimation.indicatorsWithoutValue) > 1 ? 's' : ''} à calculer
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Temps estimé : <strong>{formatEstimatedTime(recalculateAll ? batchEstimation.estimatedSecondsAll : batchEstimation.estimatedSeconds)}</strong>
                  </p>

                  {/* Checkbox to recalculate all */}
                  {batchEstimation.totalCalculableIndicators > batchEstimation.indicatorsWithoutValue && (
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      color: '#475569'
                    }}>
                      <input
                        type="checkbox"
                        checked={recalculateAll}
                        onChange={(e) => onRecalculateAllChange?.(e.target.checked)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <span>Recalculer tous les {batchEstimation.totalCalculableIndicators} indicateurs</span>
                    </label>
                  )}
                </div>
                {onStartCalculation && (
                  <button
                    onClick={onStartCalculation}
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      margin: '0 auto',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    <Sparkles size={20} />
                    <span>Démarrer le calcul</span>
                  </button>
                )}
                {onCancelBatch && (
                  <button
                    onClick={onCancelBatch}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      backgroundColor: 'transparent',
                      color: '#64748b',
                      border: '1px solid #cbd5e1',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '400',
                      display: 'block',
                      margin: '0.5rem auto 0',
                      width: '100%',
                    }}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : isBatchCalculating && batchProgress ? (
          <div className="messages-container">
            <CalculationProgress
              current={batchProgress.current}
              total={batchProgress.total}
              currentIndicator={batchProgress.currentIndicator}
              stepName={batchProgress.stepName}
              interventionName={batchProgress.interventionName}
              isComplete={batchProgress.current === batchProgress.total && batchProgress.total > 0}
              onCancel={onCancelBatch}
            />
          </div>
        ) : focusedCell && conversation && conversation.length > 0 ? (
          <div className="messages-container">
            {/* Show assumptions context */}
            <AssumptionsPanel
              systemAssumptions={systemData?.assumptions}
              stepAssumptions={step?.assumptions}
              interventionAssumptions={intervention?.assumptions}
              stepName={step?.name}
              interventionName={intervention?.name}
            />

            <ConversationHistory messages={conversation} />

            {isRefining && (
              <div className="loading">
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            )}
          </div>
        ) : focusedCell ? (
          <div className="messages-container">
            {/* Show assumptions even if no conversation yet */}
            <AssumptionsPanel
              systemAssumptions={systemData?.assumptions}
              stepAssumptions={step?.assumptions}
              interventionAssumptions={intervention?.assumptions}
              stepName={step?.name}
              interventionName={intervention?.name}
            />

            <div className="empty-card">
              <div className="empty-content">
                <p className="mb-4">Aucune conversation pour cette valeur.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-card">
            <div className="empty-content">
              <p className="mb-4">Bonjour ! Je suis votre assistant de simulation d'itinéraires techniques.</p>
              <p>Pour calculer un indicateur avec l'IA, cliquez sur une cellule vide du tableau pour ouvrir ce panneau, puis utilisez le bouton "Calculer cette valeur".</p>
              <p>Je peux vous aider à :</p>
              <ul>
                <li>Calculer des valeurs d'indicateurs basées sur le contexte</li>
                <li>Affiner les résultats selon vos précisions</li>
                <li>Expliquer les hypothèses et sources utilisées</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Input - always show if there's a focused cell */}
      {focusedCell && (
        <div className="message-input">
          <MessageInput
            onSend={handleSendMessage}
            disabled={isRefining}
          />

          {/* Calculate/Recalculate button */}
          {onCalculate && (
            <button
              onClick={async () => {
                setIsCalculating(true);
                try {
                  await onCalculate();
                } finally {
                  setIsCalculating(false);
                }
              }}
              disabled={isCalculating}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: isCalculating ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: isCalculating ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0.75rem auto 0',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              {isCalculating ? (
                <>
                  <span>Calcul en cours...</span>
                </>
              ) : (
                <>
                  <span>🤖</span>
                  <span>{valueEntry && valueEntry.value !== null && valueEntry.value !== undefined ? 'Recalculer cet indicateur' : 'Calculer cet indicateur'}</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
