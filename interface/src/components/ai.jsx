import React, { useState, useEffect, useRef } from 'react';
import './ai.css';

function AI() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { id: Date.now(), text: question, isAI: false }]);

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: `I understand you're asking about "${question}". Based on your notes about sensors, I can provide detailed information about distance sensors, cameras, and ground sensors. Would you like me to elaborate on any specific type?`, 
        isAI: true 
      }]);
    }, 1000);

    setQuestion('');
  };

  return (
    <div className="ai-container">
      <div className="ai-header">
        <h2>🤖 Ask AI Assistant</h2>
        <p>Get intelligent insights about your notes and documents</p>
      </div>

      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="centered-input">
              <form onSubmit={handleSubmit} className="question-form centered">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask me anything about your notes..."
                  className="question-input"
                  autoFocus
                />
                <button type="submit" className="ask-button">
                  <span className="button-text">Ask AI</span>
                  <span className="button-icon">🚀</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="messages">
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.isAI ? 'ai-message' : 'user-message'}`}>
                  <div className="message-avatar">
                    {msg.isAI ? '🤖' : '👤'}
                  </div>
                  <div className="message-content">
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="question-form">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question..."
                className="question-input"
              />
              <button type="submit" className="ask-button">
                <span className="button-text">Ask AI</span>
                <span className="button-icon">🚀</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default AI;