'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface CalculationAlertProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function CalculationAlert({
  type,
  title,
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}: CalculationAlertProps) {
  
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const colors = {
    success: {
      bg: '#f0fdf4',
      border: '#86efac',
      text: '#166534',
      icon: '#22c55e',
    },
    error: {
      bg: '#fef2f2',
      border: '#fca5a5',
      text: '#991b1b',
      icon: '#ef4444',
    },
    info: {
      bg: '#eff6ff',
      border: '#93c5fd',
      text: '#1e40af',
      icon: '#3b82f6',
    },
  };

  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : Info;
  const colorScheme = colors[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        maxWidth: '400px',
        backgroundColor: colorScheme.bg,
        border: `1px solid ${colorScheme.border}`,
        borderRadius: '0.5rem',
        padding: '1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
        <Icon size={20} style={{ color: colorScheme.icon, flexShrink: 0, marginTop: '0.125rem' }} />
        
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            fontWeight: '600', 
            fontSize: '0.875rem', 
            color: colorScheme.text,
            marginBottom: '0.25rem',
          }}>
            {title}
          </h4>
          <p style={{ 
            fontSize: '0.875rem', 
            color: colorScheme.text,
            whiteSpace: 'pre-line',
          }}>
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: colorScheme.text,
            cursor: 'pointer',
            padding: '0.25rem',
            opacity: 0.7,
            fontSize: '1.25rem',
            lineHeight: 1,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
        >
          ×
        </button>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
