import React, { useState, useEffect } from 'react';
import { Briefcase, DollarSign, Calendar, MapPin, Sparkles, Plus, Check } from 'lucide-react';
import DayView from './DayView';
import Refinement from './Refinement';

export default function Itinerary({
  tripData,
  activeDay,
  setActiveDay,
  moveStop,
  deleteStop,
  updateStop,
  addStop,
  refineTrip,
  loading,
  loadingStatus
}) {
  const [packingList, setPackingList] = useState([]);
  const [newPackingItem, setNewPackingItem] = useState('');
  const [showAddStopForm, setShowAddStopForm] = useState(false);
  
  // State for adding a new manual stop
  const [newStopDetails, setNewStopDetails] = useState({
    time: '12:00 PM',
    activity: '',
    location: '',
    description: '',
    estimatedCost: 'Free',
    duration: '1 hour',
    category: 'Sightseeing'
  });

  // Sync packing list from LLM data initially
  useEffect(() => {
    if (tripData?.packingSuggestions) {
      setPackingList(
        tripData.packingSuggestions.map((item, idx) => ({
          id: `pack-${idx}`,
          text: item,
          checked: false
        }))
      );
    }
  }, [tripData]);

  // Compute cost stats dynamically
  const getCostBreakdown = () => {
    if (!tripData) return { total: 0, categories: {} };

    let total = 0;
    const categories = {};

    tripData.itinerary.forEach(day => {
      day.stops.forEach(stop => {
        // Simple regex to parse numbers from strings like "$15 USD", "Free", "$80", "50", etc.
        const costStr = stop.estimatedCost || '0';
        let amount = 0;
        
        if (!costStr.toLowerCase().includes('free')) {
          const match = costStr.match(/\d+(?:\.\d+)?/);
          if (match) {
            amount = parseFloat(match[0]);
          }
        }

        total += amount;
        
        const cat = stop.category || 'Other';
        categories[cat] = (categories[cat] || 0) + amount;
      });
    });

    return { total, categories };
  };

  const costData = getCostBreakdown();

  const handleTogglePackingItem = (id) => {
    setPackingList(prev =>
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  const handleAddPackingItem = (e) => {
    e.preventDefault();
    if (!newPackingItem.trim()) return;

    setPackingList(prev => [
      ...prev,
      {
        id: `pack-manual-${Date.now()}`,
        text: newPackingItem.trim(),
        checked: false
      }
    ]);
    setNewPackingItem('');
  };

  const handleAddStopSubmit = (e) => {
    e.preventDefault();
    if (!newStopDetails.activity.trim()) return;

    addStop(activeDay, newStopDetails);
    setShowAddStopForm(false);
    
    // Reset state
    setNewStopDetails({
      time: '12:00 PM',
      activity: '',
      location: '',
      description: '',
      estimatedCost: 'Free',
      duration: '1 hour',
      category: 'Sightseeing'
    });
  };

  const activeDayData = tripData.itinerary.find(day => day.dayNumber === activeDay) || tripData.itinerary[0];

  return (
    <div className="dashboard-grid">
      {/* Left panel: Timeline and day details */}
      <div className="left-panel">
        <div className="trip-hero glass-panel">
          <div className="trip-meta">
            <span className="badge cat-other">
              <MapPin size={12} />
              {tripData.destination}
            </span>
            <span className="badge cat-transit">
              <Calendar size={12} />
              {tripData.durationDays} Days
            </span>
            <span className="badge cat-relaxation">
              <DollarSign size={12} />
              {tripData.budgetLevel || 'Moderate'}
            </span>
          </div>
          <h2>{tripData.tripTitle}</h2>
          <p className="trip-summary">{tripData.tripSummary}</p>
        </div>

        {/* Day Selector Tabs */}
        <div className="day-tab-container">
          {tripData.itinerary.map(day => (
            <button
              key={day.dayNumber}
              className={`day-tab ${activeDay === day.dayNumber ? 'active' : ''}`}
              onClick={() => {
                setActiveDay(day.dayNumber);
                setShowAddStopForm(false);
              }}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>

        {/* Day Header Info */}
        {activeDayData && (
          <div className="day-header">
            <span className="day-theme-title">
              Theme: {activeDayData.dayTheme}
            </span>
          </div>
        )}

        {/* Stop Cards Timeline */}
        {activeDayData && (
          <DayView
            dayNumber={activeDay}
            stops={activeDayData.stops}
            moveStop={moveStop}
            deleteStop={deleteStop}
            updateStop={updateStop}
          />
        )}

        {/* Manual Stop Adding drawer toggle */}
        {!showAddStopForm ? (
          <button 
            className="outline-btn" 
            onClick={() => setShowAddStopForm(true)}
            style={{ width: '100%', borderStyle: 'dashed', justifyContent: 'center', marginTop: '16px' }}
          >
            <Plus size={16} /> Add Custom Activity Stop
          </button>
        ) : (
          <div className="add-stop-panel glass-panel">
            <h4 style={{ marginBottom: '12px', fontSize: '1rem' }}>Add Custom Stop - Day {activeDay}</h4>
            <form onSubmit={handleAddStopSubmit}>
              <div className="edit-form-grid">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 02:00 PM"
                    value={newStopDetails.time} 
                    onChange={e => setNewStopDetails({...newStopDetails, time: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category</label>
                  <select 
                    value={newStopDetails.category} 
                    onChange={e => setNewStopDetails({...newStopDetails, category: e.target.value})}
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
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Activity Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Visit Golden Pavilion"
                    value={newStopDetails.activity} 
                    onChange={e => setNewStopDetails({...newStopDetails, activity: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Kyoto Old Town"
                    value={newStopDetails.location} 
                    onChange={e => setNewStopDetails({...newStopDetails, location: e.target.value})} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Duration / Est Cost</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. 2 hours"
                      value={newStopDetails.duration} 
                      onChange={e => setNewStopDetails({...newStopDetails, duration: e.target.value})} 
                    />
                    <input 
                      type="text" 
                      placeholder="e.g. $10 USD"
                      value={newStopDetails.estimatedCost} 
                      onChange={e => setNewStopDetails({...newStopDetails, estimatedCost: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="edit-form-span-2">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description</label>
                  <textarea 
                    placeholder="Details about what to see, what to do..."
                    value={newStopDetails.description} 
                    onChange={e => setNewStopDetails({...newStopDetails, description: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="outline-btn" onClick={() => setShowAddStopForm(false)}>Cancel</button>
                <button type="submit" className="glow-btn">Add Stop</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Right panel widgets */}
      <div className="right-panel">
        
        {/* Cost Analytics Widget */}
        <div className="widget glass-panel">
          <div className="widget-title">
            <DollarSign size={18} />
            Cost Analysis (Est.)
          </div>
          
          <div className="cost-analytics">
            <div style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', margin: '10px 0' }}>
              ${costData.total.toFixed(0)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>USD Total</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.keys(costData.categories).map(cat => {
                const amount = costData.categories[cat];
                const percentage = costData.total > 0 ? (amount / costData.total) * 100 : 0;
                
                // Get css class
                const lowerCat = cat.toLowerCase();
                let barColor = 'var(--primary)';
                if (lowerCat === 'sightseeing') barColor = 'var(--cat-sightseeing, #06b6d4)';
                else if (lowerCat === 'food') barColor = 'var(--cat-food, #f97316)';
                else if (lowerCat === 'relaxation') barColor = 'var(--cat-relaxation, #10b981)';
                else if (lowerCat === 'adventure') barColor = 'var(--cat-adventure, #8b5cf6)';
                else if (lowerCat === 'shopping') barColor = 'var(--cat-shopping, #ec4899)';
                else if (lowerCat === 'transit') barColor = 'var(--cat-transit, #6b7280)';

                return (
                  <div key={cat} className="cost-bar-row">
                    <div className="cost-bar-info">
                      <span className="cost-bar-label">{cat}</span>
                      <span className="cost-bar-value">${amount.toFixed(0)} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="cost-bar-bg">
                      <div className="cost-bar-fill" style={{ width: `${percentage}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Packing Checklist Widget */}
        <div className="widget glass-panel">
          <div className="widget-title">
            <Briefcase size={18} />
            Packing Assistant
          </div>
          <ul className="packing-list">
            {packingList.map(item => (
              <li 
                key={item.id} 
                className={`packing-item ${item.checked ? 'checked' : ''}`}
                onClick={() => handleTogglePackingItem(item.id)}
              >
                <div className="packing-checkbox">
                  {item.checked && <Check size={12} color="#fff" />}
                </div>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          
          <form onSubmit={handleAddPackingItem} style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <input
              type="text"
              className="theme-select"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
              placeholder="Add item..."
              value={newPackingItem}
              onChange={e => setNewPackingItem(e.target.value)}
            />
            <button type="submit" className="outline-btn" style={{ padding: '8px 12px' }}>Add</button>
          </form>
        </div>

        {/* AI Refinement Loop Widget */}
        <div className="widget glass-panel refinement-widget">
          <div className="widget-title">
            <Sparkles size={18} />
            Refine with AI
          </div>
          <Refinement
            onSubmit={refineTrip}
            loading={loading}
            loadingStatus={loadingStatus}
          />
        </div>
      </div>
    </div>
  );
}
