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
            <div className="message message-assistant">
              {/* Content */}
              <div className="content">
                {message.content}
              </div>

              {/* Metadata sections */}
              {message.assumptions && message.assumptions.length > 0 && (
                <div className="metadata">
                  <strong className="metadata-title">Hypothèses:</strong>
                  <ul className="metadata-list">
                    {message.assumptions.map((assumption, i) => (
                      <li key={i}>{assumption}</li>
                    ))}
                  </ul>
                </div>
              )}

              {message.calculation_steps && message.calculation_steps.length > 0 && (
                <div className="metadata">
                  <strong className="metadata-title">Étapes de calcul:</strong>
                  <ol className="metadata-list metadata-list--ordered">
                    {message.calculation_steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {message.sources && message.sources.length > 0 && (
                <div className="metadata">
                  <strong className="metadata-title">Sources:</strong>
                  <ul className="metadata-list">
                    {message.sources.map((source, i) => (
                      <li key={i}>{source}</li>
                    ))}
                  </ul>
                </div>
              )}

              {message.confidence && (
                <div className="metadata">
                  <strong className="confidence">Niveau de confiance: </strong>
                  <span className={`confidence-badge confidence-badge--${message.confidence}`}>
                    {message.confidence === 'high' ? '🟢 Élevé' :
                     message.confidence === 'medium' ? '🟡 Moyen' :
                     '🔴 Faible'}
                  </span>
                </div>
              )}

              {message.caveats && message.caveats.length > 0 && (
                <div className="caveats">
                  <strong className="caveats-title">⚠️ Limitations:</strong>
                  <ul className="caveats-list">
                    {message.caveats.map((caveat, i) => (
                      <li key={i}>{caveat}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timestamp */}
              <p className="timestamp">
                {formatTimestamp(message.timestamp)}
              </p>
            </div>
          ) : (
            /* User message - right aligned with green background */
            <div className="message-user-wrapper">
              <div className="message message-user">
                <p className="content">
                  {message.content}
                </p>
                <p className="timestamp">
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
