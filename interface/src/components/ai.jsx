import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ai.css';

function AI({
  notes = [],
  aiPrompt = '',
  autoSubmit = false,
  onAutoSent = () => {},
  highlightedText = null,
  slideName = null
}) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll chat to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendQuery = useCallback(async (userQuestion) => {
    console.log('💬 sendQuery called with:', userQuestion);
    
    if (!userQuestion.trim() || isLoading) {
      console.log('⚠️ sendQuery skipped - empty question or already loading');
      return;
    }

    console.log('📨 Sending to backend:', {
      userQuestion,
      notesCount: notes.length,
      highlightedText,
      slideName
    });

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: userQuestion,
        isAI: false
      }
    ]);

    setIsLoading(true);
    setQuestion('');

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion: userQuestion,
          question: userQuestion, // legacy support
          notes: notes,
          highlightedText: highlightedText,
          slideName: slideName
        })
      });

      console.log('📥 Response status:', response.status);

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            text: data.response,
            isAI: true
          }
        ]);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: '❌ Unable to connect to AI server.',
          isAI: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, notes, highlightedText, slideName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuery(question);
  };

  const handleManualPrompt = useCallback((manualPrompt) => {
    console.log('🎤 handleManualPrompt called with:', manualPrompt);
    
    // Prefill the input
    setQuestion(manualPrompt || '');

    // If autoSubmit is enabled, send immediately (and notify parent)
    if (manualPrompt && autoSubmit && !isLoading) {
      console.log('✅ Auto-submit conditions met - calling sendQuery');
      sendQuery(manualPrompt);
      onAutoSent();
    } else {
      console.log('⚠️ Auto-submit skipped:', { hasPrompt: !!manualPrompt, autoSubmit, isLoading });
    }
  }, [autoSubmit, isLoading, sendQuery, onAutoSent]);

  // Fill input when aiPrompt arrives (highlighted text) and auto-send if needed
  useEffect(() => {
    console.log('🤖 AI useEffect triggered:', { aiPrompt, autoSubmit, isLoading });
    
    if (aiPrompt) {
      // Use handleManualPrompt to handle both prefill and auto-submit logic
      if (autoSubmit && !isLoading) {
        console.log('⏰ Setting 300ms timer for auto-submit');
        const timer = setTimeout(() => {
          console.log('🚀 Timer fired - calling handleManualPrompt');
          handleManualPrompt(aiPrompt);
        }, 300);
        return () => clearTimeout(timer);
      } else {
        // Just prefill without auto-submit
        console.log('📝 Just prefilling question input (no auto-submit)');
        setQuestion(aiPrompt);
      }
    }
  }, [aiPrompt, autoSubmit, isLoading, handleManualPrompt]);

  return (
    <div className="ai-container">
      <div className="ai-header">
        <h2>🤖 Ask AI Assistant</h2>
        <p>Triggered only when you highlight text or ask manually</p>
      </div>

      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <form onSubmit={handleSubmit} className="question-form centered">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Highlight text or ask a question..."
                className="question-input"
                disabled={isLoading}
                autoFocus
              />
              <button className="ask-button" disabled={isLoading}>
                {isLoading ? '⏳' : '🚀 Ask AI'}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="messages">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`message ${msg.isAI ? 'ai-message' : 'user-message'}`}
                >
                  <div className="message-avatar">
                    {msg.isAI ? '🤖' : '👤'}
                  </div>
                  <div className="message-content">{msg.text}</div>
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
                disabled={isLoading}
              />
              <button className="ask-button" disabled={isLoading}>
                {isLoading ? '⏳' : '🚀 Ask AI'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default AI;
