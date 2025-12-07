import React, { useState } from 'react';
import './view.css';

const View = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setUploadedFile(file);
    if (onFileUpload) {
      onFileUpload(file);
    }
    console.log('File uploaded:', file.name);
  };

  return (
    <div 
      className={`upload-container ${dragActive ? 'drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="upload-content">
        <div className="upload-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        
        <h3 className="upload-title">Upload Document</h3>
        
        {uploadedFile ? (
          <div className="uploaded-file-info">
            <p className="file-name">📄 {uploadedFile.name}</p>
            <p className="file-size">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
            <button 
              className="remove-file-btn"
              onClick={() => setUploadedFile(null)}
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <p className="upload-subtitle">Drag and drop your files here</p>
            
            <label className="upload-btn-label">
              <input
                type="file"
                className="file-input"
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.txt,.md"
              />
              <span className="upload-btn">Choose File</span>
            </label>
            
            
          </>
        )}
      </div>
    </div>
  );
};

export default View;