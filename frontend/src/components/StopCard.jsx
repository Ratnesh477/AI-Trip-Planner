import React, { useState } from 'react';
import { 
  Clock, MapPin, DollarSign, Hourglass, Edit3, Trash2, 
  ArrowUp, ArrowDown, ChevronDown, ChevronUp, Check, X 
} from 'lucide-react';

export default function StopCard({
  stop,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  onUpdate
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({ ...stop });

  const toggleExpand = (e) => {
    // Prevent expanding if clicking input controls or buttons
    if (
      e.target.closest('button') || 
      e.target.closest('input') || 
      e.target.closest('select') || 
      e.target.closest('textarea')
    ) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onUpdate(editFields);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditFields({ ...stop });
    setIsEditing(false);
  };

  // Get matching category class
  const getCategoryClass = (cat) => {
    const lower = (cat || 'other').toLowerCase();
    if (['sightseeing', 'food', 'relaxation', 'adventure', 'transit', 'shopping', 'other'].includes(lower)) {
      return `cat-${lower}`;
    }
    return 'cat-other';
  };

  return (
    <div 
      className={`stop-card glass-panel`}
      onClick={toggleExpand}
      style={{ borderLeftWidth: '4px', borderLeftColor: `var(--cat-${(stop.category || 'other').toLowerCase()})` }}
    >
      {!isEditing ? (
        // --- DISPLAY MODE ---
        <>
          <div className="stop-header">
            <div className="stop-title-group">
              <span className="stop-time">{stop.time}</span>
              <div>
                <h4 className="stop-activity">{stop.activity}</h4>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  <MapPin size={12} /> {stop.location || 'Local Spot'}
                </span>
              </div>
            </div>
            
            <div className="stop-actions">
              <span className={`badge ${getCategoryClass(stop.category)}`} style={{ marginRight: '8px' }}>
                {stop.category || 'Other'}
              </span>

              {/* Reordering Controls */}
              <button 
                className="icon-btn" 
                onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                disabled={isFirst}
                title="Move Up"
              >
                <ArrowUp size={14} />
              </button>
              <button 
                className="icon-btn" 
                onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                disabled={isLast}
                title="Move Down"
              >
                <ArrowDown size={14} />
              </button>

              {/* Edit and Delete */}
              <button 
                className="icon-btn" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsEditing(true); 
                  setIsExpanded(true); // Always expand when editing
                }}
                title="Edit Stop"
              >
                <Edit3 size={14} />
              </button>
              <button 
                className="icon-btn danger" 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                title="Remove Stop"
              >
                <Trash2 size={14} />
              </button>

              {/* Expand Chevron */}
              <button className="icon-btn" style={{ marginLeft: '4px' }}>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Expanded detail pane */}
          {isExpanded && (
            <div className="stop-expanded-content">
              <p className="stop-description">{stop.description}</p>
              
              <div className="stop-details-row">
                <div className="stop-detail-item">
                  <Hourglass size={14} />
                  <span>Duration: {stop.duration || 'Flexible'}</span>
                </div>
                <div className="stop-detail-item">
                  <DollarSign size={14} />
                  <span>Est. Cost: {stop.estimatedCost || 'Free'}</span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // --- EDITING MODE ---
        <form onSubmit={handleEditSubmit} onClick={(e) => e.stopPropagation()}>
          <div className="edit-form-grid">
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time</label>
              <input
                type="text"
                className="theme-select"
                value={editFields.time}
                onChange={(e) => setEditFields({ ...editFields, time: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category</label>
              <select
                className="theme-select"
                value={editFields.category}
                onChange={(e) => setEditFields({ ...editFields, category: e.target.value })}
              >
                <option value="Sightseeing">Sightseeing</option>
                <option value="Food">Food</option>
                <option value="Relaxation">Relaxation</option>
                <option value="Adventure">Adventure</option>
                <option value="Transit">Transit</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="edit-form-span-2">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Activity</label>
              <input
                type="text"
                className="theme-select"
                value={editFields.activity}
                onChange={(e) => setEditFields({ ...editFields, activity: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location</label>
              <input
                type="text"
                className="theme-select"
                value={editFields.location}
                onChange={(e) => setEditFields({ ...editFields, location: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Duration / Est Cost</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="theme-select"
                  placeholder="Duration"
                  value={editFields.duration}
                  onChange={(e) => setEditFields({ ...editFields, duration: e.target.value })}
                />
                <input
                  type="text"
                  className="theme-select"
                  placeholder="Estimated Cost"
                  value={editFields.estimatedCost}
                  onChange={(e) => setEditFields({ ...editFields, estimatedCost: e.target.value })}
                />
              </div>
            </div>

            <div className="edit-form-span-2">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description</label>
              <textarea
                className="prompt-textarea"
                style={{ minHeight: '60px' }}
                value={editFields.description}
                onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifySelf: 'end', gap: '8px', marginTop: '12px' }}>
            <button 
              type="button" 
              className="outline-btn"
              onClick={handleCancelEdit}
              style={{ padding: '6px 12px' }}
            >
              <X size={14} /> Cancel
            </button>
            <button 
              type="submit" 
              className="glow-btn"
              style={{ padding: '6px 12px' }}
            >
              <Check size={14} /> Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
