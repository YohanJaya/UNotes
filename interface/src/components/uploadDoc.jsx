import React, { useState } from 'react';
import './uploadDoc.css';

function UploadDoc({ onSlideSelect, onTextSelect }) {

  // ✅ State
  const [uploading, setUploading] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [highlightedText, setHighlightedText] = useState('');

  // ✅ Function to select a slide and notify parent
  const selectSlide = (slideData) => {
    // Update local state
    setSelectedSlide(slideData);
    
    // Notify parent component (App.jsx)
    if (onSlideSelect) {
      onSlideSelect(slideData);
    }
  };

  // ✅ Function to handle text selection from document
  const handleTextSelection = () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText && onTextSelect) {
      // Automatically send to AI prompt
      onTextSelect(selectedText);
      setHighlightedText(selectedText);
      
      // Clear highlighted text after a short delay
      setTimeout(() => {
        setHighlightedText('');
        window.getSelection().removeAllRanges();
      }, 2000);
    }
  };

  // ✅ Combined file selection and upload function
  const fileUpload = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;  // Do nothing if no file selected

    setUploading(true);  // Start upload simulation

    setTimeout(() => {
      // Create slide data structure from uploaded file
      const slideData = {
        id: Date.now(),
        name: selectedFile.name,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        type: selectedFile.type,
        url: URL.createObjectURL(selectedFile),  // Create preview URL
        file: selectedFile
      };

      // Use selectSlide function to handle selection
      selectSlide(slideData);

      // Reset upload state
      setUploading(false);
      
      // Reset file input
      e.target.value = '';
    }, 1500);
  };



  return (
    <div className="upload-container">
      <div className="upload-header">
        <h2>Upload Slide</h2>
        <p>Upload a slide to get AI explanation</p>
      </div>

      {!selectedSlide && (
        <div className="upload-area">
          <input
            type="file"
            id="file-input"
            onChange={fileUpload}
            className="file-input"
            disabled={uploading}
          />

          <label 
            htmlFor="file-input" 
            className={`browse-btn ${uploading ? 'uploading' : ''}`}
          >
            {uploading ? 'Uploading...' : 'Browse & Upload'}
          </label>

          {uploading && (
            <div className="uploading-message">
              <span>⏳ Processing your file...</span>
            </div>
          )}
        </div>
      )}

      {selectedSlide && (
        <div className="uploaded-doc-section">
          <div className="doc-header">
            <h3>📄 Uploaded Document</h3>
          </div>
          
          <div className="doc-details">
            <div className="doc-info">
              <p className="doc-name">
                <strong>Name:</strong> {selectedSlide.name}
              </p>
              <p className="doc-size">
                <strong>Size:</strong> {selectedSlide.size}
              </p>
              <p className="doc-type">
                <strong>Type:</strong> {selectedSlide.type}
              </p>
            </div>

            {selectedSlide.url && (
              <div 
                className="doc-preview"
                onMouseUp={handleTextSelection}
              >
                <p><strong>Preview:</strong></p>
                {selectedSlide.type.includes('pdf') ? (
                  <embed 
                    src={selectedSlide.url} 
                    type="application/pdf" 
                    width="100%" 
                    height="400px"
                  />
                ) : selectedSlide.type.includes('image') ? (
                  <img 
                    src={selectedSlide.url} 
                    alt={selectedSlide.name}
                    style={{ maxWidth: '100%', maxHeight: '400px' }}
                  />
                ) : (
                  <p className="no-preview">Preview not available for this file type</p>
                )}
              </div>
            )}
          </div>

          {/* Show confirmation when text is highlighted */}
          {highlightedText && (
            <div className="highlighted-text-section">
              <div className="highlight-notification">
                <span className="notification-icon">✅</span>
                <div className="notification-content">
                  <p className="notification-title">Text copied to AI prompt!</p>
                  <p className="highlighted-content">"{highlightedText}"</p>
                </div>
              </div>
            </div>
          )}

          <button 
            className="remove-doc-btn"
            onClick={() => selectSlide(null)}
          >
            ❌ Remove Document
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadDoc;
