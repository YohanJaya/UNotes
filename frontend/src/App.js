import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import AIAssistant from './components/AIAssistant';
import PDFViewer from './components/PDFViewer';
import { 
  Folder, 
  Star, 
  Archive, 
  Trash2, 
  FileText,
  Search,
  Settings
} from 'lucide-react';

function App() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('unotes-notes');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'Welcome to UNotes!',
        content: '# Welcome 👋\n\nThis is your first note in UNotes!\n\n## Features:\n- 📝 **Rich text editing**\n- 🏷️ **Tag organization**\n- 🔍 **Smart search**\n- 🤖 **AI assistance**\n- 📎 **File attachments**\n\nTry creating a new note or ask the AI assistant for help!',
        tags: ['welcome', 'getting-started'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: true,
        isArchived: false,
        color: 'bg-blue-50',
        category: 'notes'
      },
      {
        id: '2',
        title: 'Meeting Notes: Q1 Planning',
        content: '## Agenda\n1. Project timeline review\n2. Resource allocation\n3. Risk assessment\n\n## Action Items\n- [ ] Update project docs\n- [ ] Schedule client meeting\n- [ ] Prepare budget report',
        tags: ['work', 'meeting', 'important'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        isPinned: true,
        isArchived: false,
        color: 'bg-green-50',
        category: 'work'
      },
      {
        id: '3',
        title: 'Shopping List',
        content: '- 🥛 Milk\n- 🥚 Eggs\n- 🍞 Bread\n- 🍎 Fruits\n- 🥦 Vegetables\n- ☕ Coffee',
        tags: ['personal', 'shopping'],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        isPinned: false,
        isArchived: false,
        color: 'bg-yellow-50',
        category: 'personal'
      }
    ];
  });

  const [selectedNote, setSelectedNote] = useState(notes[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  const categories = [
    { id: 'all', name: 'All Notes', icon: <FileText size={20} />, count: notes.length },
    { id: 'notes', name: 'Notes', icon: <FileText size={20} />, count: notes.filter(n => n.category === 'notes').length },
    { id: 'work', name: 'Work', icon: <Folder size={20} />, count: notes.filter(n => n.category === 'work').length },
    { id: 'personal', name: 'Personal', icon: <Folder size={20} />, count: notes.filter(n => n.category === 'personal').length },
    { id: 'pinned', name: 'Pinned', icon: <Star size={20} />, count: notes.filter(n => n.isPinned).length },
    { id: 'archived', name: 'Archived', icon: <Archive size={20} />, count: notes.filter(n => n.isArchived).length },
    { id: 'trash', name: 'Trash', icon: <Trash2 size={20} />, count: 0 }
  ];

  useEffect(() => {
    localStorage.setItem('unotes-notes', JSON.stringify(notes));
  }, [notes]);

  const handleCreateNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isArchived: false,
      color: 'bg-white',
      category: 'notes'
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
  };

  const handleUpdateNote = (updatedNote) => {
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date().toISOString() } : note
    );
    setNotes(updatedNotes);
  };

  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    if (selectedNote?.id === id) {
      setSelectedNote(updatedNotes[0] || null);
    }
  };

  const handleTogglePin = (id) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    );
    setNotes(updatedNotes);
  };

  const handleToggleArchive = (id) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, isArchived: !note.isArchived } : note
    );
    setNotes(updatedNotes);
  };

  const filteredNotes = notes.filter(note => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return note.title.toLowerCase().includes(query) || 
             note.content.toLowerCase().includes(query) ||
             note.tags.some(tag => tag.toLowerCase().includes(query));
    }
    
    if (selectedCategory === 'pinned') return note.isPinned;
    if (selectedCategory === 'archived') return note.isArchived;
    if (selectedCategory !== 'all') return note.category === selectedCategory;
    
    return !note.isArchived;
  });

  const handleOpenPDF = (url) => {
    setPdfUrl(url);
    setShowPDFViewer(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header 
        onSearch={setSearchQuery}
        onCreateNote={handleCreateNote}
        onToggleAI={() => setShowAIAssistant(!showAIAssistant)}
        onOpenPDF={() => handleOpenPDF('https://example.com/sample.pdf')}
      />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4">
            <button 
              onClick={handleCreateNote}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <span>+</span>
              <span>New Note</span>
            </button>
          </div>
          
          <div className="flex-1 px-3 overflow-y-auto scrollbar-thin">
            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`sidebar-item w-full ${selectedCategory === category.id ? 'sidebar-item-active' : ''}`}
                >
                  <span className="text-gray-500">{category.icon}</span>
                  <span className="flex-1 text-left">{category.name}</span>
                  <span className="text-sm text-gray-400">{category.count}</span>
                </button>
              ))}
            </nav>
            
            <div className="mt-8 px-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Tags
              </h3>
              <div className="space-y-2">
                {Array.from(new Set(notes.flatMap(n => n.tags))).slice(0, 5).map(tag => (
                  <button
                    key={tag}
                    className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50"
                  >
                    <span>#{tag}</span>
                    <span className="text-xs text-gray-400">
                      {notes.filter(n => n.tags.includes(tag)).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <button className="sidebar-item w-full">
              <Settings size={20} />
              <span className="flex-1 text-left">Settings</span>
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex">
          <div className={`${selectedNote ? 'w-1/3' : 'w-full'} border-r border-gray-200`}>
            <NoteList 
              notes={filteredNotes}
              selectedNote={selectedNote}
              onSelectNote={setSelectedNote}
              onTogglePin={handleTogglePin}
              onToggleArchive={handleToggleArchive}
              searchQuery={searchQuery}
            />
          </div>
          
          {selectedNote && (
            <div className="w-2/3">
              <NoteEditor 
                note={selectedNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                onTogglePin={() => handleTogglePin(selectedNote.id)}
                onToggleArchive={() => handleToggleArchive(selectedNote.id)}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <AIAssistant 
          onClose={() => setShowAIAssistant(false)}
          currentNote={selectedNote}
          onApplySuggestion={(suggestion) => {
            if (selectedNote) {
              handleUpdateNote({
                ...selectedNote,
                content: selectedNote.content + '\n\n' + suggestion
              });
            }
          }}
        />
      )}
      
      {/* PDF Viewer Modal */}
      {showPDFViewer && (
        <PDFViewer 
          url={pdfUrl}
          onClose={() => setShowPDFViewer(false)}
        />
      )}
    </div>
  );
}

export default App;