import React from 'react';
import { Pin, Archive, MoreVertical, Clock, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const NoteList = ({ 
  notes, 
  selectedNote, 
  onSelectNote, 
  onTogglePin, 
  onToggleArchive,
  searchQuery 
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {searchQuery ? `Search Results (${notes.length})` : `All Notes (${notes.length})`}
          </h2>
          <div className="text-sm text-gray-500">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Archive className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note)}
              className={`card p-4 cursor-pointer transition-all hover:translate-x-1 ${
                selectedNote?.id === note.id
                  ? 'ring-2 ring-blue-500 border-blue-500'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800 truncate">
                  {searchQuery ? highlightText(note.title, searchQuery) : note.title}
                </h3>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(note.id);
                    }}
                    className={`p-1 rounded ${note.isPinned ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                  >
                    <Pin size={16} className={note.isPinned ? 'fill-yellow-500' : ''} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleArchive(note.id);
                    }}
                    className="p-1 rounded text-gray-400 hover:text-gray-600"
                  >
                    <Archive size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-1 rounded text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className={`${note.color} p-3 rounded-lg mb-3`}>
                <div className="text-sm text-gray-600 line-clamp-3">
                  {searchQuery ? (
                    <span className="whitespace-pre-line">
                      {highlightText(note.content.replace(/[#*`\[\]]/g, '').substring(0, 200), searchQuery)}
                      {note.content.length > 200 && '...'}
                    </span>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <div className="font-bold" {...props} />,
                        h2: ({node, ...props}) => <div className="font-bold" {...props} />,
                        h3: ({node, ...props}) => <div className="font-bold" {...props} />,
                        p: ({node, ...props}) => <div {...props} />,
                        ul: ({node, ...props}) => <div className="pl-4" {...props} />,
                        li: ({node, ...props}) => <div {...props} />
                      }}
                    >
                      {note.content.substring(0, 200) + (note.content.length > 200 ? '...' : '')}
                    </ReactMarkdown>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                  
                  {note.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag size={12} />
                      <div className="flex space-x-1">
                        {note.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="note-tag">
                            {searchQuery ? highlightText(tag, searchQuery) : tag}
                          </span>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="text-gray-400">+{note.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  note.category === 'work' ? 'bg-green-100 text-green-800' :
                  note.category === 'personal' ? 'bg-purple-100 text-purple-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {note.category}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NoteList;