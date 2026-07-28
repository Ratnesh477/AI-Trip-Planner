import React, { useState } from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

const SUGGESTIONS = [
  {
    title: "Kyoto Food & Temples (3 Days)",
    destination: "Kyoto, Japan",
    days: 3,
    budget: "Moderate",
    prompt: "I am visiting Kyoto for 3 days with family. We love traditional temples, local street markets, and want a relaxed pace with delicious food options."
  },
  {
    title: "Iceland Waterfalls (5 Days)",
    destination: "Iceland",
    days: 5,
    budget: "Luxury",
    prompt: "A 5-day road trip around Iceland's Golden Circle and South Coast. We want to hike waterfalls, soak in hot springs, and visit glacial lagoons."
  },
  {
    title: "Paris Art & Cafes (4 Days)",
    destination: "Paris, France",
    days: 4,
    budget: "Budget",
    prompt: "I am traveling to Paris solo on a budget. I want to visit major art galleries, spend time reading in cafes, and discover cheap local street food in the Latin Quarter."
  },
  {
    title: "Tokyo Tech & Neon (2 Days)",
    destination: "Tokyo, Japan",
    days: 2,
    budget: "Moderate",
    prompt: "A quick 2-day fast-paced exploration of Tokyo. Focus on futuristic museums, arcade culture in Akihabara, neon skylines, and ramen spots."
  }
];

export default function InputForm({ onSubmit, onDemoLoad }) {
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(3);
  const [budgetLevel, setBudgetLevel] = useState('Moderate');
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destination.trim()) return;

    // Build the full prompt we send to the backend
    const fullPrompt = `Destination: ${destination}
Duration: ${durationDays} days
Budget Level: ${budgetLevel}
Custom Requests & Details: ${prompt || 'No custom details, plan a balanced trip.'}

Please generate an itinerary fitting these specifications. Make sure it contains exactly ${durationDays} days.`;

    onSubmit(fullPrompt);
  };

  const applySuggestion = (sug) => {
    setDestination(sug.destination);
    setDurationDays(sug.days);
    setBudgetLevel(sug.budget);
    setPrompt(sug.prompt);
  };

  return (
    <div className="welcome-container">
      <div className="welcome-title-group">
        <h1>Craft Your Next Odyssey</h1>
        <p>Describe your dream vacation, and our generative engine will build a bespoke, interactive itinerary.</p>
      </div>

      <div className="prompt-card glass-panel">
        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <div className="form-group">
              <label htmlFor="destination">Where are you going?</label>
              <input
                type="text"
                id="destination"
                className="theme-select"
                placeholder="e.g. Kyoto, London, Costa Rica"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="duration">How many days?</label>
              <input
                type="number"
                id="duration"
                className="duration-input"
                min="1"
                max="10"
                value={durationDays}
                onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="budget">Budget Level</label>
            <select
              id="budget"
              className="theme-select"
              value={budgetLevel}
              onChange={(e) => setBudgetLevel(e.target.value)}
            >
              <option value="Budget">Budget (Cost-conscious, local dining)</option>
              <option value="Moderate">Moderate (Good balance, popular sights)</option>
              <option value="Luxury">Luxury (Boutique hotels, premium tours)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="details">Who are you traveling with? What do you love to do?</label>
            <textarea
              id="details"
              className="prompt-textarea"
              placeholder="e.g. Traveling with kids, foodie tour, slow pacing, focus on museums, skip shopping spots..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', marginBottom: '24px' }}>
            <button 
              type="submit" 
              className="glow-btn"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={!destination.trim()}
            >
              <Sparkles size={18} />
              Weave Itinerary
            </button>

            <button 
              type="button" 
              className="outline-btn"
              onClick={() => onDemoLoad(destination || "Kyoto, Japan")}
              title="Load static demo trip instantly (Offline Mode)"
            >
              Offline Demo Mode
            </button>
          </div>
        </form>

        <div className="prompt-suggestions">
          <div className="suggestion-header">Inspiration Ideas</div>
          <div className="suggestions-grid">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                type="button"
                className="suggestion-btn"
                onClick={() => applySuggestion(sug)}
                title={sug.prompt}
              >
                {sug.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
