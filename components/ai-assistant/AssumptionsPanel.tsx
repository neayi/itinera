'use client';

import { useState } from 'react';
import { parseAssumptionsMarkdown, detectConflicts } from '@/lib/ai/assumptions-parser';

interface AssumptionsPanelProps {
  systemAssumptions?: string;
  stepAssumptions?: string;
  interventionAssumptions?: string;
  stepName?: string;
  interventionName?: string;
}

export default function AssumptionsPanel({
  systemAssumptions,
  stepAssumptions,
  interventionAssumptions,
  stepName,
  interventionName,
}: AssumptionsPanelProps) {
  const [openSections, setOpenSections] = useState({
    system: true,
    step: true,
    intervention: true,
  });

  const toggleSection = (section: 'system' | 'step' | 'intervention') => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Parse assumptions
  const systemItems = parseAssumptionsMarkdown(systemAssumptions);
  const stepItems = parseAssumptionsMarkdown(stepAssumptions);
  const interventionItems = parseAssumptionsMarkdown(interventionAssumptions);

  // Detect conflicts
  const conflicts = detectConflicts(systemAssumptions, stepAssumptions, interventionAssumptions);

  const hasAnyAssumptions = systemItems.length > 0 || stepItems.length > 0 || interventionItems.length > 0;

  if (!hasAnyAssumptions && conflicts.length === 0) {
    return (
      <div className="assumptions">
        <p>Aucune hypothèse définie pour ce calcul.</p>
        <p>L'IA utilisera ses connaissances générales de l'agriculture française.</p>
      </div>
    );
  }

  return (
    <div className="assumptions">
      {/* Conflicts warning */}
      {conflicts.length > 0 && (
        <div className="conflicts">
          <div className="conflicts-header">
            <span className="conflicts-title">⚠️ Conflits détectés</span>
          </div>
          <ul className="conflicts-list">
            {conflicts.map((conflict, i) => (
              <li key={i}>{conflict}</li>
            ))}
          </ul>
        </div>
      )}

      {/* System level */}
      {systemItems.length > 0 && (
        <div className="section">
          <button
            onClick={() => toggleSection('system')}
            className="section-header section-header--system"
          >
            <span className="section-title section-title--system">🌐 Système</span>
            <span className="section-toggle section-toggle--system">{openSections.system ? '−' : '+'}</span>
          </button>
          {openSections.system && (
            <div className="section-content">
              <ul className="list">
                {systemItems.map((item, i) => (
                  <li key={i} className="item">
                    <span className="bullet bullet--system">•</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Step level */}
      {stepItems.length > 0 && (
        <div className="section">
          <button
            onClick={() => toggleSection('step')}
            className="section-header section-header--step"
          >
            <span className="section-title section-title--step">
              📅 Étape {stepName && `— ${stepName}`}
            </span>
            <span className="section-toggle section-toggle--step">{openSections.step ? '−' : '+'}</span>
          </button>
          {openSections.step && (
            <div className="section-content">
              <ul className="list">
                {stepItems.map((item, i) => (
                  <li key={i} className="item">
                    <span className="bullet bullet--step">•</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Intervention level */}
      {interventionItems.length > 0 && (
        <div className="section">
          <button
            onClick={() => toggleSection('intervention')}
            className="section-header section-header--intervention"
          >
            <span className="section-title section-title--intervention">
              🔧 Intervention {interventionName && `— ${interventionName}`}
            </span>
            <span className="section-toggle section-toggle--intervention">{openSections.intervention ? '−' : '+'}</span>
          </button>
          {openSections.intervention && (
            <div className="section-content">
              <ul className="list">
                {interventionItems.map((item, i) => (
                  <li key={i} className="item">
                    <span className="bullet bullet--intervention">•</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
