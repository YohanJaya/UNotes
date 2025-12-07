import React, { useState } from 'react';
import './note.css';

const Note = ({ 
  id,
  title = "Types of Common Sensors",
  content = "Distance Sensors: Measure distance to objects (e.g., DistancesSensor).\nCamera: Capture images or detect colors (e.g., Camera).\nGround Sensors: Detect floor color, lines, or markers (e.g., DistancesSensor or Camera pointing down)",
  date = new Date().toLocaleDateString(),
  isNew = false,
  onDelete,
  onEdit,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [noteTitle, setNoteTitle] = useState(title);
  const [noteContent, setNoteContent] = useState(content);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(id, { title: noteTitle, content: noteContent });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (isNew && onDelete) {
      onDelete(id);
    } else {
      setNoteTitle(title);
      setNoteContent(content);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this note?')) {
      onDelete(id);
    }
  };

  const truncatedContent = noteContent.length > 150 && !isExpanded 
    ? `${noteContent.substring(0, 150)}...` 
    : noteContent;

  return (
    <div className="note-card">
      <div className="note-header">
        {isEditing ? (
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="note-title-input"
            placeholder="Note Title"
            autoFocus
          />
        ) : (
          <h3 className="note-title">{noteTitle}</h3>
        )}
        
        <div className="note-actions">
          {isEditing ? (
            <>
              <button className="note-btn save-btn" onClick={handleSave}>
                <span className="btn-icon">✓</span>
              </button>
              <button className="note-btn cancel-btn" onClick={handleCancel}>
                <span className="btn-icon">×</span>
              </button>
            </>
          ) : (
            <>
              <button 
                className="note-btn edit-btn" 
                onClick={() => setIsEditing(true)}
                title="Edit Note"
              >
                <span className="btn-icon">✎</span>
              </button>
              <button 
                className="note-btn delete-btn" 
                onClick={handleDelete}
                title="Delete Note"
              >
                <span className="btn-icon">🗑</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="note-date">{date}</div>

      <div className="note-content">
        {isEditing ? (
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="note-content-input"
            placeholder="Enter your note content here..."
            rows="6"
          />
        ) : (
          <>
            <div className="note-content-text">
              {truncatedContent.split('\n').map((line, index) => (
                <p key={index} className="note-paragraph">
                  {line.startsWith('- ') ? (
                    <>
                      <span className="bullet">•</span>
                      {line.substring(2)}
                    </>
                  ) : (
                    line
                  )}
                </p>
              ))}
            </div>
            {noteContent.length > 150 && (
              <button 
                className="expand-btn"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </button>
            )}
          </>
        )}
      </div>

      {!isEditing && (
        <div className="note-footer">
          <div className="note-tags">
            <span className="note-tag">Sensors</span>
            <span className="note-tag">Robotics</span>
            <span className="note-tag">Hardware</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Note;