import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';

export default function Refinement({ onSubmit, loading, loadingStatus }) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "You can modify this trip using follow-up instructions! Try asking me to: \n• 'Add a budget-friendly lunch to Day 2'\n• 'Swap Day 1 and Day 3 themes'\n• 'Make Day 2 morning activities more active'"
    }
  ]);

  const historyEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userPrompt = prompt.trim();
    setPrompt('');

    // Append user message to log
    setMessages(prev => [
      ...prev,
      {
        id: `msg-user-${Date.now()}`,
        sender: 'user',
        text: userPrompt
      }
    ]);

    // Fire API call
    onSubmit(userPrompt);
  };

  // Detect when generation completes successfully to post a message
  useEffect(() => {
    if (!loading && messages.length > 1 && messages[messages.length - 1].sender === 'user') {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-assistant-${Date.now()}`,
          sender: 'assistant',
          text: "✨ Trip details modified successfully!"
        }
      ]);
    }
  }, [loading]);

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Scrollable Message History */}
      <div className="refinement-history">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`refine-message ${msg.sender}`}
            style={{ whiteSpace: 'pre-line' }}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="refine-message assistant">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="spinner-ring" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />
              {loadingStatus || 'Applying changes...'}
            </span>
          </div>
        )}
        <div ref={historyEndRef} />
      </div>

      {/* Input controls */}
      <form onSubmit={handleSubmit} className="refinement-form">
        <textarea
          className="refinement-input"
          placeholder={loading ? "AI is processing changes..." : "Type modifications (e.g. Swap Day 1 and 2)..."}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button 
          type="submit" 
          className="glow-btn" 
          style={{ width: '40px', height: '40px', padding: 0, justifyContent: 'center', flexShrink: 0 }}
          disabled={!prompt.trim() || loading}
          title="Send Refinement"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
