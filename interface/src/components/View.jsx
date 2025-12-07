import React, { useState } from 'react';
import './view.css';

const View = ({ 
  notes = [],
  onAddNote,
  onDeleteNote,
  onSaveNote,
  onSelectNote
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');

  // Filter notes based on search and tag
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === 'all' || note.tags?.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const handleAddNote = () => {
    if (onAddNote) {
      onAddNote();
    }
  };

  // Get all unique tags from notes
  const allTags = [...new Set(notes.flatMap(note => note.tags || []))];

  return (
    <div className="view-container">
      {/* Header Section */}
      <div className="view-header">
        <h2 className="view-title">My Notes</h2>
        <button className="add-note-btn" onClick={handleAddNote}>
          <span className="add-icon">+</span>
          New Note
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="view-controls">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-tags">
          <button 
            className={`tag-filter ${filterTag === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTag('all')}
          >
            All
          </button>
          {allTags.map(tag => (
            <button 
              key={tag}
              className={`tag-filter ${filterTag === tag ? 'active' : ''}`}
              onClick={() => setFilterTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="notes-grid">
        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No notes found</h3>
            <p>Create your first note to get started!</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div 
              key={note.id} 
              className="note-preview-card"
              onClick={() => onSelectNote && onSelectNote(note.id)}
            >
              <div className="note-preview-header">
                <h3 className="note-preview-title">{note.title}</h3>
                <div className="note-preview-actions">
                  <button 
                    className="note-preview-btn edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNote && onSelectNote(note.id);
                    }}
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button 
                    className="note-preview-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this note?')) {
                        onDeleteNote && onDeleteNote(note.id);
                      }
                    }}
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </div>

              <div className="note-preview-date">{note.date}</div>

              <div className="note-preview-content">
                {note.content.substring(0, 150)}
                {note.content.length > 150 && '...'}
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="note-preview-tags">
                  {note.tags.map((tag, index) => (
                    <span key={index} className="note-preview-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="view-footer">
        <span className="note-count">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          {searchQuery && ' found'}
        </span>
      </div>
    </div>
  );
};

export default View;