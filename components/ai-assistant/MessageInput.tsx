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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Posez une question..."
        disabled={isSending || disabled}
        className="flex-1 px-4 py-2 h-[38px] border border-[#d1d5dc] rounded-[10px] text-[14px] tracking-[-0.1504px] text-[rgba(10,10,10,0.5)] placeholder:text-[rgba(10,10,10,0.5)] focus:outline-none focus:ring-2 focus:ring-[#6b9571]"
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
        className="bg-[#6b9571] text-white rounded-[10px] w-[48px] h-[38px] flex items-center justify-center hover:bg-[#5a8560] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSending ? (
          <span className="text-white">...</span>
        ) : (
          <Send />
        )}
      </button>
    </form>
  );
}
