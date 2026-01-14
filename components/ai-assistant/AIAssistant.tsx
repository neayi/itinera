'use client';

import { useState } from 'react';
import { ConversationMessage } from '@/lib/types';
import ConversationHistory from './ConversationHistory';
import MessageInput from './MessageInput';
import svgPaths from '@/components/imports/svg-abbk4gof4j';

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
}

export default function AIAssistant({
  isOpen,
  focusedCell,
  systemData,
  systemId,
  onClose,
  onValueUpdate,
}: AIAssistantProps) {
  const [isRefining, setIsRefining] = useState(false);

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
      className="w-[420px] flex bg-white shadow-[0px_25px_16px_-12px_rgba(180,180,180,0.25)] border-l border-gray-200 flex-col flex-shrink-0"
      data-ai-assistant="true"
    >
      {/* Header */}
      <div className="bg-[#f5f5f0] h-[64px] border-b border-[#ebebeb] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Sparkle icon */}
          <div className="relative shrink-0 size-[20px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
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
          <h3 className="font-normal text-[16px] leading-[24px] tracking-[-0.3125px] text-[#212121]">
            {focusedCell ? `Assistant IA - ${focusedCell.indicatorKey}` : 'Assistant de simulation'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="bg-[#edf0f2] rounded size-[32px] flex items-center justify-center hover:bg-gray-300 transition-colors text-center pt-[6px] pr-[0px] pb-[0px] pl-[12px]"
          title="Replier le panneau"
        >
          <svg className="size-5" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
            <path d={svgPaths.p324d0480} stroke="#707070" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </button>
      </div>

      {/* Context Banner - only show if there's a focused cell */}
      {focusedCell && intervention && (
        <div className="bg-[#ebf7ff] border-b border-[#ebebeb] px-6 py-3">
          <div className="font-['Inter'] text-[13px] leading-[20px] tracking-[-0.3008px] text-[#101828]">
            <span className="font-medium">{intervention.name}</span>
            {intervention.description && (
              <span className="text-[#6a7282]"> · {intervention.description}</span>
            )}
          </div>
          <div className="font-['Inter'] text-[12px] leading-[16px] text-[#6a7282] mt-1">
            Étape: {step?.name}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 bg-[#f5f5f0]">
        {focusedCell && conversation && conversation.length > 0 ? (
          <div className="space-y-4">
            <ConversationHistory messages={conversation} />
            
            {isRefining && (
              <div className="bg-white rounded-[10px] border border-gray-200 shadow-sm px-4 py-3 inline-block">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-[#6b9571] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#6b9571] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[#6b9571] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
        ) : focusedCell ? (
          <div className="bg-white rounded-[10px] border border-gray-200 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-[18px]">
            <div className="font-['Inter'] text-[14px] leading-[20px] tracking-[-0.3008px] text-[#101828]">
              <p className="mb-2">Aucune conversation pour cette valeur.</p>
              <p>Cliquez sur le bouton 🤖 pour calculer avec l'IA.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[10px] border border-gray-200 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-[18px]">
            <div className="font-['Inter'] text-[14px] leading-[20px] tracking-[-0.3008px] text-[#101828]">
              <p className="mb-4">Bonjour ! Je suis votre assistant de simulation d'itinéraires techniques.</p>
              <p className="mb-4">Pour calculer un indicateur avec l'IA, cliquez sur le bouton 🤖 dans une cellule vide du tableau.</p>
              <p>Je peux vous aider à :</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
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
        <div className="border-t border-gray-200 bg-white px-6 pt-[25px] pb-6">
          <MessageInput 
            onSend={handleSendMessage}
            disabled={isRefining}
          />
        </div>
      )}
    </aside>
  );
}
