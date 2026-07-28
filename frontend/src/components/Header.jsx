import React, { useState, useEffect } from 'react';
import { Compass, Moon, Sun, Key, Save, Trash2, FolderOpen } from 'lucide-react';

export default function Header({
  customApiKey,
  setCustomApiKey,
  savedTrips,
  loadSavedTrip,
  deleteSavedTrip,
  tripData,
  saveCurrentTrip,
  onReset
}) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('odyssey_theme') || 'dark';
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(customApiKey);
  const [showSavedList, setShowSavedList] = useState(false);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('odyssey_theme', theme);
  }, [theme]);

  // Sync state with prop if modal opens
  useEffect(() => {
    if (showKeyModal) {
      setTempApiKey(customApiKey);
    }
  }, [showKeyModal, customApiKey]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    setCustomApiKey(tempApiKey.trim());
    setShowKeyModal(false);
  };

  return (
    <>
      <header className="app-header">
        <div className="logo-container" onClick={onReset}>
          <Compass className="logo-icon" size={28} />
          <span className="logo-title">ODYSSEY</span>
        </div>

        <div className="header-actions">
          {/* Saved Trips Toggle */}
          <div style={{ position: 'relative' }}>
            <button 
              className="outline-btn" 
              onClick={() => setShowSavedList(!showSavedList)}
              title="Saved Sessions"
            >
              <FolderOpen size={18} />
              <span className="logo-title">Trips ({savedTrips.length})</span>
            </button>

            {showSavedList && (
              <div 
                className="glass-panel" 
                style={{ 
                  position: 'absolute', 
                  right: 0, 
                  top: '48px', 
                  width: '280px', 
                  maxHeight: '320px', 
                  overflowY: 'auto', 
                  zIndex: 150, 
                  padding: '12px' 
                }}
              >
                <h4 style={{ marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>SAVED TRIPS</h4>
                {savedTrips.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                    No saved trips yet.
                  </p>
                ) : (
                  savedTrips.map(trip => (
                    <div 
                      key={trip.id} 
                      className="saved-trip-item"
                      onClick={() => {
                        loadSavedTrip(trip.id);
                        setShowSavedList(false);
                      }}
                    >
                      <div className="saved-trip-details">
                        <span className="saved-trip-title">{trip.data.tripTitle}</span>
                        <span className="saved-trip-sub">{trip.data.destination} • {trip.data.durationDays}d</span>
                      </div>
                      <button 
                        className="icon-btn danger" 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${trip.data.tripTitle}"?`)) {
                            deleteSavedTrip(trip.id);
                          }
                        }}
                        title="Delete Trip"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Save Active Trip */}
          {tripData && (
            <button 
              className="outline-btn" 
              onClick={() => {
                saveCurrentTrip();
                alert('Trip saved successfully!');
              }}
              title="Save Trip to Local Sessions"
            >
              <Save size={18} />
              <span className="logo-title">Save Trip</span>
            </button>
          )}

          {/* API Config Button */}
          <button 
            className={`outline-btn ${customApiKey ? 'success' : ''}`}
            onClick={() => setShowKeyModal(true)}
            style={customApiKey ? { borderColor: 'var(--success)', color: 'var(--success)' } : {}}
            title="Configure Gemini API Key"
          >
            <Key size={18} />
            <span className="logo-title">{customApiKey ? 'API Key Configured' : 'Set API Key'}</span>
          </button>

          {/* Theme Toggle */}
          <button 
            className="icon-btn" 
            onClick={toggleTheme} 
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* API Key Config Modal */}
      {showKeyModal && (
        <div className="modal-overlay" onClick={() => setShowKeyModal(false)}>
          <div className="modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <h3>Configure API Credentials</h3>
            <p>
              By default, Odyssey attempts to use the <code>GEMINI_API_KEY</code> set in your backend <code>.env</code> file. 
              Alternatively, you can paste your personal key here. It remains secure in browser storage and is never shipped or logged.
            </p>
            
            <form onSubmit={handleSaveKey}>
              <div className="form-group">
                <label htmlFor="modalApiKey">Gemini API Key</label>
                <input
                  type="password"
                  id="modalApiKey"
                  className="theme-select"
                  placeholder="AIzaSy..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="outline-btn"
                  onClick={() => setShowKeyModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="glow-btn"
                >
                  Apply Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
