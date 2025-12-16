import React, { useState, useEffect } from 'react';
import './note.css';

function NoteTaking({ onNotesUpdate }) {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: "Types of Common Sensors",
      content: [
        "Distance Sensors: Measure distance to objects (e.g., DistancesSensor).",
        "Camera: Capture images or detect colors (e.g., Camera).",
        "Ground Sensors: Detect floor color, lines, or markers (e.g., DistancesSensor or Camera pointing down)"
      ],
      date: "2024-01-15",
      tags: ["sensors", "robotics", "technology"]
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showRecentSidebar, setShowRecentSidebar] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: ""
  });

  // Update parent component whenever notes change
  useEffect(() => {
    if (onNotesUpdate) {
      onNotesUpdate(notes);
    }
  }, [notes, onNotesUpdate]);

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const noteContent = newNote.content.split('\n').filter(line => line.trim());
    
    const newNoteObj = {
      id: Date.now(),
      title: newNote.title,
      content: noteContent,
      date: new Date().toISOString().split('T')[0],
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    setNotes([newNoteObj, ...notes]);
    setNewNote({ title: "", content: "", tags: "" });
    setShowAddForm(false);
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <div className="header-left">
          <h2>📝 Notes</h2>
          <p>Your sensor knowledge base</p>
        </div>
        <div className="header-actions">
          <button 
            className="recent-notes-btn" 
            onClick={() => setShowRecentSidebar(!showRecentSidebar)}
            title="Recent Notes"
          >
            📋
          </button>
          <button 
            className="add-note-icon-btn" 
            onClick={() => setShowAddForm(!showAddForm)}
            title="Add New Note"
          >
            +
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="add-note-modal">
          <div className="add-note-form">
            <input
              type="text"
              placeholder="Note Title"
              value={newNote.title}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              className="note-title-input"
            />
            <textarea
              placeholder="Enter note content (one point per line)"
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              className="note-content-input"
              rows="4"
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={newNote.tags}
              onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
              className="note-tags-input"
            />
            <div className="form-actions">
              <button onClick={handleAddNote} className="save-btn">
                Save Note
              </button>
              <button onClick={() => setShowAddForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Recent Notes Sidebar */}
      <div className={`recent-sidebar ${showRecentSidebar ? 'open' : ''}`}>
        <div className="recent-sidebar-header">
          <h3>📋 Recent Notes</h3>
          <button 
            className="close-sidebar-btn" 
            onClick={() => setShowRecentSidebar(false)}
          >
            ✕
          </button>
        </div>
        <div className="recent-notes-list">
          {notes.map(note => (
            <div key={note.id} className="recent-note-item">
              <div className="recent-note-title">{note.title}</div>
              <div className="recent-note-date">{note.date}</div>
              <div className="recent-note-tags">
                {note.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="recent-tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {showRecentSidebar && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setShowRecentSidebar(false)}
        ></div>
      )}

      <div className="notes-grid">
        {notes.map(note => (
          <div key={note.id} className="note-card">
            <div className="note-header">
              <h3>{note.title}</h3>
              <span className="note-date">{note.date}</span>
            </div>
            
            <div className="note-content">
              <ul>
                {note.content.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="note-tags">
              {note.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>

            <div className="note-actions">
              <button className="action-btn edit-btn">✏️ Edit</button>
              <button className="action-btn delete-btn">🗑️ Delete</button>
              <button className="action-btn share-btn">📤 Share</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NoteTaking;