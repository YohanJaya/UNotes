import React, { useState } from 'react';
import AI from './components/ai';
import NoteTaking from './components/note';
import UploadDoc from './components/uploadDoc';
import './App.css';

function App() {
  const [aiPrompt, setAiPrompt] = useState('');
  const [notes, setNotes] = useState([]);
  const [autoSubmit, setAutoSubmit] = useState(false);

  // Called when text is highlighted
  const handleTextSelect = (text) => {
    const prompt = `Explain the following excerpt in simple terms for an undergraduate student. 
List key points and why it matters:\n\n"${text}"`;

    setAiPrompt(prompt);
    setAutoSubmit(true); // 🔥 ONLY trigger
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
          />
        </div>
      </main>
    </div>
  );
}

export default App;
