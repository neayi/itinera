'use client';

import { useState } from 'react';
import { ConversationMessage } from '@/lib/types';
import { getIndicatorLabel } from '@/lib/indicator-labels';
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
}: AIAssistantProps) {
  const [isRefining, setIsRefining] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

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
            {focusedCell ? `Assistant IA - ${getIndicatorLabel(focusedCell.indicatorKey)}` : 'Assistant de simulation'}
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
        {isBatchCalculating && batchProgress ? (
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
                      margin: '0 auto',
                    }}
                  >
                    {isCalculating ? (
                      <>
                        <span>Calcul en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>🤖</span>
                        <span>Calculer cette valeur</span>
                      </>
                    )}
                  </button>
                )}
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

      {/* Input - only show if there's a conversation */}
      {focusedCell && conversation && conversation.length > 0 && (
        <div className="message-input">
          <MessageInput 
            onSend={handleSendMessage}
            disabled={isRefining}
          />
        </div>
      )}
    </aside>
  );
}
