import React from 'react';
import { XCircle } from 'lucide-react';

export default function LoadingState({ status, onCancel }) {
  return (
    <div className="loading-container">
      {/* Visual loader rings */}
      <div className="spinner-wrapper">
        <div className="spinner-ring" />
        <div className="spinner-inner" />
      </div>

      {/* Progress updates */}
      <div className="status-stepper">
        <div className="status-indicator">
          {status || 'Contacting Odyssey Core...'}
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          This can take between 5 to 15 seconds depending on LLM output complexity.
        </p>
      </div>

      {/* Cancellation control */}
      {onCancel && (
        <button 
          className="outline-btn loading-cancel-btn" 
          onClick={onCancel}
          style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
          title="Abort Current Request"
        >
          <XCircle size={16} />
          Cancel Planning
        </button>
      )}

      {/* Pulsing visual skeleton loaders */}
      <div style={{ width: '100%', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="skeleton skeleton-title" style={{ width: '40%' }} />
          <div className="skeleton skeleton-line" style={{ width: '100%' }} />
          <div className="skeleton skeleton-line" style={{ width: '85%' }} />
        </div>

        <div className="timeline" style={{ paddingLeft: '28px', position: 'relative' }}>
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
        </div>
      </div>
    </div>
  );
}
