import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SystemSettings, WikiPage } from './types';
import { ContextTab } from './ContextTab';
import { SystemTab } from './SystemTab';
import './system-settings-modal.scss';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemId: string;
  currentSettings: SystemSettings;
  onSave: (settings: SystemSettings) => Promise<void>;
}

export function SystemSettingsModal({
  isOpen,
  onClose,
  systemId,
  currentSettings,
  onSave,
}: SystemSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'context' | 'system'>('context');
  const [settings, setSettings] = useState<SystemSettings>(currentSettings);
  const [soils, setSoils] = useState<WikiPage[]>([]);
  const [specifications, setSpecifications] = useState<WikiPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load soils and specifications
  useEffect(() => {
    if (isOpen) {
      setSettings(currentSettings);
      loadWikiData();
    }
  }, [isOpen, currentSettings]);

  const loadWikiData = async () => {
    setIsLoading(true);
    try {
      const [soilsRes, specsRes] = await Promise.all([
        fetch('/api/wiki/soils'),
        fetch('/api/wiki/specifications'),
      ]);

      if (soilsRes.ok) {
        const soilsData = await soilsRes.json();
        setSoils(soilsData);
      }

      if (specsRes.ok) {
        const specsData = await specsRes.json();
        setSpecifications(specsData);
      }
    } catch (error) {
      console.error('Error loading wiki data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSettings(currentSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="system-settings-overlay">
      <div className="system-settings-modal p-3" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Paramètres du système</h2>
          <button className="close-button" onClick={handleCancel}>
            <X className="size-5" />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab ${activeTab === 'context' ? 'active' : ''}`}
            onClick={() => setActiveTab('context')}
          >
            Contexte
          </button>
          <button
            className={`tab ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            Système
          </button>
        </div>

        <div className="modal-content">
          {activeTab === 'context' && (
            <ContextTab
              settings={settings}
              onUpdate={setSettings}
              soils={soils}
              isLoading={isLoading}
            />
          )}
          {activeTab === 'system' && (
            <SystemTab
              settings={settings}
              onUpdate={setSettings}
              specifications={specifications}
              isLoading={isLoading}
            />
          )}
        </div>

        <div className="modal-footer mt-3">
          <button
            className="btn-secondary"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Annuler
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </div>
  );
}
