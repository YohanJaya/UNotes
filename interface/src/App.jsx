import React, { useState } from 'react';
import AI from './components/ai';
import NoteTaking from './components/note';
import UploadDoc from './components/uploadDoc';
import './App.css';

function App() {

  // ✅ State
  const [aiPrompt, setAiPrompt] = useState('');
  const [notes, setNotes] = useState([]);
  const [selectedSlide, setSelectedSlide] = useState(null);

  // ✅ Called when a slide/file is selected
  const handleSlideSelect = (slide) => {
    setSelectedSlide(slide);
    // Note: AI component will automatically trigger AUTO_MODE
    // when selectedSlide changes - no need to manually set prompt
  };

  // ✅ Called when text is selected from document
  const handleTextSelect = (text) => {
    setAiPrompt(text);
  };

  // ✅ Notes update
  const updateNotes = (updatedNotes) => {
    setNotes(updatedNotes);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1># UNotes</h1>
      </header>

      <main className="main-content-grid">
        {/* Left Panel */}
        <div className="left-panel">
          <NoteTaking onNotesUpdate={updateNotes} />
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <UploadDoc 
            onSlideSelect={handleSlideSelect}
            onTextSelect={handleTextSelect}
          />

          <AI
            aiPrompt={aiPrompt}
            notes={notes}
            selectedSlide={selectedSlide}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
