'use client';

import { ConversationMessage } from '@/lib/types';

interface ConversationHistoryProps {
  messages: ConversationMessage[];
}

export default function ConversationHistory({ messages }: ConversationHistoryProps) {
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <>
      {messages.map((message, index) => (
        <div key={index}>
          {message.role === 'assistant' || message.role === 'system' ? (
            <div className="bg-white rounded-[10px] border border-gray-200 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-[18px] mb-4">
              {/* Content */}
              <div className="font-['Inter'] text-[14px] leading-[20px] tracking-[-0.3008px] text-[#101828] whitespace-pre-line">
                {message.content}
              </div>

              {/* Metadata sections */}
              {message.assumptions && message.assumptions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
                  <strong className="block mb-2 text-[13px] text-[#374151]">Hypothèses:</strong>
                  <ul className="list-disc ml-5 text-[13px] text-[#6b7280] space-y-1">
                    {message.assumptions.map((assumption, i) => (
                      <li key={i}>{assumption}</li>
                    ))}
                  </ul>
                </div>
              )}

              {message.calculation_steps && message.calculation_steps.length > 0 && (
                <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
                  <strong className="block mb-2 text-[13px] text-[#374151]">Étapes de calcul:</strong>
                  <ol className="list-decimal ml-5 text-[13px] text-[#6b7280] space-y-1">
                    {message.calculation_steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
                  <strong className="block mb-2 text-[13px] text-[#374151]">Sources:</strong>
                  <ul className="list-disc ml-5 text-[13px] text-[#6b7280] space-y-1">
                    {message.sources.map((source, i) => (
                      <li key={i}>{source}</li>
                    ))}
                  </ul>
                </div>
              )}

              {message.confidence && (
                <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
                  <strong className="text-[13px] text-[#374151]">Niveau de confiance: </strong>
                  <span className={`inline-block ml-2 px-2 py-1 rounded text-[12px] font-medium ${
                    message.confidence === 'high' ? 'bg-green-100 text-green-700' :
                    message.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {message.confidence === 'high' ? '🟢 Élevé' :
                     message.confidence === 'medium' ? '🟡 Moyen' :
                     '🔴 Faible'}
                  </span>
                </div>
              )}

              {message.caveats && message.caveats.length > 0 && (
                <div className="mt-4 pt-4 border-l-4 border-yellow-400 bg-yellow-50 rounded px-3 py-2">
                  <strong className="block mb-2 text-[13px] text-yellow-900">⚠️ Limitations:</strong>
                  <ul className="list-disc ml-5 text-[13px] text-yellow-800 space-y-1">
                    {message.caveats.map((caveat, i) => (
                      <li key={i}>{caveat}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timestamp */}
              <p className="font-['Inter'] text-[12px] leading-[16px] text-[#6a7282] mt-4">
                {formatTimestamp(message.timestamp)}
              </p>
            </div>
          ) : (
            /* User message - right aligned with green background */
            <div className="flex justify-end mb-4">
              <div className="bg-[#6b9571] rounded-[10px] shadow-sm px-4 py-3 max-w-[80%]">
                <p className="font-normal text-[14px] leading-[20px] text-white whitespace-pre-line">
                  {message.content}
                </p>
                <p className="font-normal text-[12px] leading-[16px] text-green-100 mt-1">
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
