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

  const handleBackToGrid = () => {
    setSelectedNoteId(null);
    setViewMode('grid');
  };

  const selectedNote = notes.find(note => note.id === selectedNoteId);

  return (
    <div className="App">
      {/* Header */}
      <header className="App-header">
        <div className="header-content">
          <div className="header-left">
            {viewMode === 'detail' && (
              <button className="back-btn" onClick={handleBackToGrid}>
                ← Back
              </button>
            )}
            <h1 className="app-title">UNotes</h1>
          </div>
          <p className="app-subtitle">
            {viewMode === 'grid' 
              ? `${notes.length} notes in your collection` 
              : 'Editing note'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="App-main">
        {viewMode === 'grid' ? (
          <View
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onSaveNote={handleSaveNote}
            onSelectNote={handleSelectNote}
          />
        ) : (
          selectedNote && (
            <div className="note-detail-container">
              <Note
                id={selectedNote.id}
                title={selectedNote.title}
                content={selectedNote.content}
                date={selectedNote.date}
                onSave={handleSaveNote}
                onDelete={handleDeleteNote}
              />
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="App-footer">
        <p>© 2025 UNotes - Your smart note-taking companion</p>
      </footer>
    </div>
  );
}

export default App;
