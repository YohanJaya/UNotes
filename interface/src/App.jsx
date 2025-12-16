import React, { useState } from 'react';
import AI from './components/ai';
import NoteTaking from './components/note';
import UploadDoc from './components/uploadDoc';
import './App.css';

function App() {
  const [aiPrompt, setAiPrompt] = useState('');
  const [notes, setNotes] = useState([]);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [highlightedText, setHighlightedText] = useState('');
  const [slideName, setSlideName] = useState(null);

  // Called when text is highlighted
  // Accepts (text, slideName) from UploadDoc
  const handleTextSelect = (text, name = null) => {
    console.log('🎯 App.handleTextSelect called with:', { text, name });
    
    const prompt = `Explain the following excerpt in simple terms for an undergraduate student.\nList key points and why it matters:\n\n"${text}"`;

    console.log('📤 Setting states - aiPrompt, highlightedText, slideName, autoSubmit=true');
    setAiPrompt(prompt);
    setHighlightedText(text);
    setSlideName(name);
    setAutoSubmit(true); // auto-send once
  };

  const updateNotes = (updatedNotes) => {
    setNotes(updatedNotes);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1># UNotes</h1>
      </header>

      <main className="main-content-grid">
        <div className="left-panel">
          <NoteTaking onNotesUpdate={updateNotes} />
        </div>

        <div className="right-panel">
          <UploadDoc onTextSelect={handleTextSelect} />

          <AI
            aiPrompt={aiPrompt}
            notes={notes}
            autoSubmit={autoSubmit}
            onAutoSent={() => setAutoSubmit(false)}
            highlightedText={highlightedText}
            slideName={slideName}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
