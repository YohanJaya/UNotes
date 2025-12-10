import React, { useState } from 'react';
import AI from './components/ai';
import NoteTaking from './components/note';
import UploadDoc from './components/uploadDoc';
import './App.css';

function App() {
  const [aiPrompt, setAiPrompt] = useState('');

  // Function to send automatic prompt to AI
  const sendPromptToAI = (prompt) => {
    setAiPrompt(prompt);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1># UNotes</h1>
      </header>
      
      <main className="main-content-grid">
        {/* Left Panel - Notes */}
        <div className="left-panel">
          <NoteTaking onSlideChange={sendPromptToAI} />
        </div>

        {/* Right Panel - Upload Document and AI */}
        <div className="right-panel">
          {/* Upload Document Section */}
          <div className="upload-section">
            <UploadDoc />
          </div>

          {/* AI Assistant Section */}
          <div className="ai-section">
            <AI aiPrompt={aiPrompt} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;