import React from 'react';
import StopCard from './StopCard';

export default function DayView({
  dayNumber,
  stops,
  moveStop,
  deleteStop,
  updateStop
}) {
  if (!stops || stops.length === 0) {
    return (
      <div 
        className="glass-panel" 
        style={{ 
          padding: '30px', 
          textAlign: 'center', 
          borderStyle: 'dashed', 
          color: 'var(--text-muted)' 
        }}
      >
        No activity stops scheduled for this day yet. 
        Click "Add Custom Activity Stop" below to start scheduling.
      </div>
    );
  }

  return (
    <div className="timeline">
      {stops.map((stop, index) => (
        <div key={stop.id} className="stop-card-container">
          <div className="timeline-dot" />
          <StopCard
            stop={stop}
            index={index}
            isFirst={index === 0}
            isLast={index === stops.length - 1}
            onMoveUp={() => moveStop(dayNumber, index, -1)}
            onMoveDown={() => moveStop(dayNumber, index, 1)}
            onDelete={() => {
              if (confirm('Are you sure you want to remove this activity stop?')) {
                deleteStop(dayNumber, stop.id);
              }
            }}
            onUpdate={(updatedFields) => updateStop(dayNumber, stop.id, updatedFields)}
          />
        </div>
      ))}
    </div>
  );
}
