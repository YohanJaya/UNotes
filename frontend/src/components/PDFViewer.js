import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, RotateCw, FileText } from 'lucide-react';

const PDFViewer = ({ url, onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate PDF loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setPageCount(5); // Mock page count
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [url]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    // Simulate download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePageChange = (e) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= pageCount) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="text-blue-600" size={24} />
            <div>
              <h2 className="font-bold text-gray-800">PDF Viewer</h2>
              <p className="text-sm text-gray-600">sample-document.pdf • 2.4 MB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="border-b border-gray-200 p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100"
                title="Zoom Out"
              >
                <ZoomOut size={20} />
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(scale * 100)}%
                </span>
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={scale * 100}
                  onChange={(e) => setScale(e.target.value / 100)}
                  className="w-32"
                />
              </div>
              
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100"
                title="Zoom In"
              >
                <ZoomIn size={20} />
              </button>
              
              <button
                onClick={handleRotate}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100"
                title="Rotate"
              >
                <RotateCw size={20} />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={currentPage}
                    onChange={handlePageChange}
                    className="w-16 px-2 py-1.5 border border-gray-300 rounded text-center"
                    min="1"
                    max={pageCount}
                  />
                  <span className="text-gray-600">of {pageCount}</span>
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pageCount, prev + 1))}
                  disabled={currentPage === pageCount}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center space-x-2"
              >
                <Download size={18} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-gray-100">
          {isLoading ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading PDF document...</p>
            </div>
          ) : (
            <div 
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
                transformOrigin: 'center center'
              }}
            >
              {/* Mock PDF Page */}
              <div className="p-8" style={{ width: '794px', height: '1123px' }}>
                <div className="border-2 border-gray-300 h-full rounded flex flex-col">
                  {/* PDF Header */}
                  <div className="bg-gray-800 text-white p-4">
                    <h1 className="text-2xl font-bold">Sample Document</h1>
                    <p className="text-gray-300">Page {currentPage} of {pageCount}</p>
                  </div>
                  
                  {/* PDF Content */}
                  <div className="p-8 flex-1">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Document Content</h2>
                        <p className="text-gray-700 leading-relaxed">
                          This is a preview of the PDF document. In a real application, 
                          this would display actual PDF content using a library like pdf.js.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-800 mb-2">Section 1</h3>
                          <p className="text-gray-600 text-sm">
                            Example content for section one of the document.
                          </p>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-800 mb-2">Section 2</h3>
                          <p className="text-gray-600 text-sm">
                            Example content for section two of the document.
                          </p>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-semibold text-gray-800 mb-3">Notes</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                          <li>This is a mock PDF viewer for demonstration</li>
                          <li>Real implementation would use pdf.js library</li>
                          <li>Supports zoom, rotate, and navigation</li>
                          <li>Can display multiple pages</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* PDF Footer */}
                  <div className="border-t border-gray-300 p-4 text-center text-gray-500 text-sm">
                    Document ID: DOC-{currentPage.toString().padStart(3, '0')} • 
                    Generated: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Document Info:</span>
              <span className="ml-2">5 pages • 2.4 MB • PDF 1.7</span>
            </div>
            <div>
              <span className="font-medium">Viewing:</span>
              <span className="ml-2">Page {currentPage} at {Math.round(scale * 100)}% scale</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;