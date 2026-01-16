'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

export type SaveStatus = 'saved' | 'saving' | 'pending' | 'error';

interface UseDebouncedSaveOptions {
  systemId: string;
  onSave: (systemData: any) => Promise<void>;
  debounceMs?: number;
}

/**
 * Hook to debounce system data saves with status tracking
 * Returns [saveStatus, triggerSave, forceSave]
 */
export function useDebouncedSave({
  systemId,
  onSave,
  debounceMs = 10000,
}: UseDebouncedSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<any>(null);
  const isSavingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Perform the actual save
  const performSave = useCallback(async (data: any) => {
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setSaveStatus('saving');
    
    try {
      await onSave(data);
      setSaveStatus('saved');
      pendingDataRef.current = null;
    } catch (error) {
      console.error('Error saving system data:', error);
      setSaveStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave]);

  // Trigger a debounced save
  const triggerSave = useCallback((systemData: any) => {
    // Store the pending data
    pendingDataRef.current = systemData;
    setSaveStatus('pending');

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (pendingDataRef.current) {
        performSave(pendingDataRef.current);
      }
    }, debounceMs);
  }, [debounceMs, performSave]);

  // Force immediate save (bypass debounce)
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (pendingDataRef.current) {
      performSave(pendingDataRef.current);
    }
  }, [performSave]);

  return { saveStatus, triggerSave, forceSave };
}
