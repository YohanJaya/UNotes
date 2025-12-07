import React, { useState, useEffect } from 'react';
import './App.css';
import Note from './components/note';
import View from './components/View';

function App() {
  const [notes, setNotes] = useState(() => {
    // Load notes from localStorage on initial render
    const savedNotes = localStorage.getItem('unotes-data');
    return savedNotes ? JSON.parse(savedNotes) : [
      {
        id: '1',
        title: 'Types of Common Sensors',
        content: 'Distance Sensors: Measure distance to objects (e.g., DistanceSensor).\nCamera: Capture images or detect colors (e.g., Camera).\nGround Sensors: Detect floor color, lines, or markers (e.g., DistanceSensor or Camera pointing down)',
        date: new Date().toLocaleDateString(),
        tags: ['Sensors', 'Robotics', 'Hardware']
      },
      {
        id: '2',
        title: 'Getting Started with React',
        content: 'React is a JavaScript library for building user interfaces. Key concepts include:\n- Components\n- Props\n- State\n- Hooks',
        date: new Date().toLocaleDateString(),
        tags: ['Programming', 'React', 'JavaScript']
      }
    ];
  });

  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'detail'

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('unotes-data', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      date: new Date().toLocaleDateString(),
      tags: []
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    setViewMode('detail');
  };

  const handleSaveNote = (id, noteData) => {
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, ...noteData, date: new Date().toLocaleDateString() }
        : note
    ));
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setViewMode('grid');
    }
  };

  const handleSelectNote = (id) => {
    setSelectedNoteId(id);
    setViewMode('detail');
  };

  const handleFileUpload = (file) => {
    console.log('File uploaded to app:', file);
    // Handle file upload logic here
  };

  const selectedNote = selectedNoteId 
    ? notes.find(note => note.id === selectedNoteId)
    : notes[0]; // Default to first note

  return (
    <div className="App">
      {/* Header */}
      <header className="App-header">
        <div className="header-content">
          <h1 className="app-title">UNotes</h1>
          <div className="header-icons">
            <button className="header-icon-btn" title="Library">
              📚
            </button>
            <button className="header-icon-btn" title="Download">
              ⬇️
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Two Panel Layout */}
      <main className="App-main">
        <div className="two-panel-layout">
          {/* Left Panel - Note Display */}
          <div className="left-panel">
            {selectedNote && (
              <Note
                id={selectedNote.id}
                title={selectedNote.title}
                content={selectedNote.content}
                date={selectedNote.date}
                onSave={handleSaveNote}
                onDelete={handleDeleteNote}
              />
            )}
          </div>

          {/* Right Panel - Upload Document */}
          <div className="right-panel">
            <View onFileUpload={handleFileUpload} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
