import React, { useState } from 'react';
import './uploadDoc.css';

function UploadDoc() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: 'Sensor_Notes.pdf', size: '2.4 MB', date: '2024-01-15' },
    { id: 2, name: 'Camera_Specs.docx', size: '1.8 MB', date: '2024-01-14' },
    { id: 3, name: 'Robot_Sensors.jpg', size: '3.2 MB', date: '2024-01-13' }
  ]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      const newFile = {
        id: Date.now(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toISOString().split('T')[0]
      };
      
      setUploadedFiles([newFile, ...uploadedFiles]);
      setFile(null);
      setUploading(false);
      
      // Reset file input
      document.getElementById('file-input').value = '';
    }, 1500);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h2>📤 Upload Document</h2>
        <p>Upload documents for AI analysis and note integration</p>
      </div>

      <div 
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="upload-icon">
          📄
        </div>
        <h3>Drag & Drop your files here</h3>
        <p className="upload-subtitle">or click to browse files</p>
        
        <input
          type="file"
          id="file-input"
          onChange={handleFileChange}
          className="file-input"
        />
        <label htmlFor="file-input" className="browse-btn">
          Browse Files
        </label>

        <p className="file-types">Supported: PDF, DOCX, TXT, JPG, PNG (Max 10MB)</p>

        {file && (
          <div className="selected-file">
            <span className="file-icon">📎</span>
            <span className="file-name">{file.name}</span>
            <span className="file-size">({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
          </div>
        )}

        <button 
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`upload-btn ${uploading ? 'uploading' : ''}`}
        >
          {uploading ? (
            <>
              <span className="spinner"></span>
              Uploading...
            </>
          ) : (
            'Upload Document'
          )}
        </button>
      </div>
    </div>
  );
}

export default UploadDoc;