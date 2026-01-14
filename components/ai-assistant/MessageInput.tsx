'use client';

import { useState } from 'react';
import svgPaths from '@/components/imports/svg-abbk4gof4j';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!message.trim() || isSending || disabled) {
      return;
    }

    setIsSending(true);
    try {
      await onSend(message.trim());
      setMessage(''); // Clear input after successful send
    } catch (error) {
      console.error('Error sending message:', error);
      // Keep the message in the input so user can retry
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Posez une question..."
        disabled={isSending || disabled}
        className="field"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <button
        type="submit"
        disabled={!message.trim() || isSending || disabled}
        className="button"
      >
        {isSending ? (
          <span>...</span>
        ) : (
          <Send />
        )}
      </button>
    </form>
  );
}
