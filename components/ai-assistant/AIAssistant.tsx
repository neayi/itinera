'use client';

import { useState } from 'react';
import { ConversationMessage } from '@/lib/types';
import ConversationHistory from './ConversationHistory';
import MessageInput from './MessageInput';
import AssumptionsPanel from './AssumptionsPanel';
import svgPaths from '@/components/imports/svg-abbk4gof4j';
import './ai-assistant.scss';

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
}

export default function AIAssistant({
  isOpen,
  focusedCell,
  systemData,
  systemId,
  onClose,
  onValueUpdate,
  onCalculate,
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
            <svg fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <g clipPath="url(#clip0_8002_1184)">
                <path d={svgPaths.pb04d200} stroke="#212121" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                <path d="M16.6667 2.5V5.83333" stroke="#212121" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                <path d="M18.3333 4.16667H15" stroke="#212121" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                <path d="M3.33333 14.1667V15.8333" stroke="#212121" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                <path d="M4.16667 15H2.5" stroke="#212121" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              </g>
              <defs>
                <clipPath id="clip0_8002_1184">
                  <rect fill="white" height="20" width="20" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <h3 className="title">
            {focusedCell ? `Assistant IA - ${focusedCell.indicatorKey}` : 'Assistant de simulation'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="close-btn"
          title="Replier le panneau"
        >
          <svg fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
            <path d={svgPaths.p324d0480} stroke="#707070" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
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
        {focusedCell && conversation && conversation.length > 0 ? (
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
