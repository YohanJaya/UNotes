import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Save, 
  Pin, 
  Archive, 
  Trash2, 
  Tag, 
  Palette,
  MoreVertical,
  Eye,
  EyeOff,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Image,
  Code
} from 'lucide-react';

const NoteEditor = ({ 
  note, 
  onUpdateNote, 
  onDeleteNote,
  onTogglePin,
  onToggleArchive
}) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState(note.tags.join(', '));
  const [isPreview, setIsPreview] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const colors = [
    'bg-white', 'bg-blue-50', 'bg-green-50', 'bg-yellow-50',
    'bg-purple-50', 'bg-pink-50', 'bg-gray-50', 'bg-red-50'
  ];

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags.join(', '));
    setIsEditing(false);
  }, [note]);

  const handleSave = () => {
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    onUpdateNote({
      ...note,
      title,
      content,
      tags: tagArray
    });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    if (field === 'title') setTitle(value);
    if (field === 'content') setContent(value);
    if (field === 'tags') setTags(value);
    if (!isEditing) setIsEditing(true);
  };

  const insertMarkdown = (prefix, suffix = '') => {
    const textarea = document.querySelector('textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    setContent(newText);
    setIsEditing(true);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={onTogglePin}
              className={`p-2 rounded ${note.isPinned ? 'bg-yellow-50 text-yellow-600' : 'text-gray-400 hover:bg-gray-100'}`}
              title={note.isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin size={18} className={note.isPinned ? 'fill-yellow-500' : ''} />
            </button>
            <button
              onClick={onToggleArchive}
              className={`p-2 rounded ${note.isArchived ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:bg-gray-100'}`}
              title={note.isArchived ? 'Unarchive' : 'Archive'}
            >
              <Archive size={18} />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="editor-toolbar-btn"
                title="Change color"
              >
                <Palette size={18} />
              </button>
              
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          onUpdateNote({ ...note, color });
                          setShowColorPicker(false);
                        }}
                        className={`w-8 h-8 rounded border ${color} ${note.color === color ? 'ring-2 ring-blue-500' : 'border-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="editor-toolbar-btn"
              title={isPreview ? 'Edit' : 'Preview'}
            >
              {isPreview ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            
            {isEditing && (
              <button
                onClick={() => {
                  setTitle(note.title);
                  setContent(note.content);
                  setTags(note.tags.join(', '));
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
            )}
            
            <button
              onClick={handleSave}
              className="btn-primary flex items-center space-x-2"
            >
              <Save size={18} />
              <span>Save</span>
            </button>
            
            <button
              onClick={() => onDeleteNote(note.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
            
            <button className="editor-toolbar-btn">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Note Title"
          className="w-full text-2xl font-bold text-gray-800 mb-4 focus:outline-none"
        />

        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => insertMarkdown('**', '**')} className="editor-toolbar-btn" title="Bold">
                <Bold size={16} />
              </button>
              <button onClick={() => insertMarkdown('*', '*')} className="editor-toolbar-btn" title="Italic">
                <Italic size={16} />
              </button>
              <button onClick={() => insertMarkdown('# ')} className="editor-toolbar-btn" title="Heading">
                H1
              </button>
              <button onClick={() => insertMarkdown('## ')} className="editor-toolbar-btn">
                H2
              </button>
              <button onClick={() => insertMarkdown('- ')} className="editor-toolbar-btn" title="Bullet List">
                <List size={16} />
              </button>
              <button onClick={() => insertMarkdown('1. ')} className="editor-toolbar-btn" title="Numbered List">
                <ListOrdered size={16} />
              </button>
              <button onClick={() => insertMarkdown('[', '](url)')} className="editor-toolbar-btn" title="Link">
                <Link size={16} />
              </button>
              <button onClick={() => insertMarkdown('![', '](image-url)')} className="editor-toolbar-btn" title="Image">
                <Image size={16} />
              </button>
              <button onClick={() => insertMarkdown('`', '`')} className="editor-toolbar-btn" title="Code">
                <Code size={16} />
              </button>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowTagInput(!showTagInput)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <Tag size={16} />
              <span>Tags</span>
            </button>
            
            {showTagInput && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 w-64">
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  placeholder="Add tags (comma separated)"
                  className="input-field text-sm"
                />
                <div className="mt-2 text-xs text-gray-500">
                  Separate tags with commas
                </div>
              </div>
            )}
          </div>
        </div>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className="note-tag flex items-center space-x-1"
              >
                <span>{tag}</span>
                <button
                  onClick={() => {
                    const newTags = note.tags.filter((_, i) => i !== index);
                    handleChange('tags', newTags.join(', '));
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Editor/Preview */}
      <div className={`flex-1 ${note.color} p-6`}>
        {isPreview ? (
          <div className="prose max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="my-3" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 my-3" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-3" {...props} />,
                li: ({node, ...props}) => <li className="my-1" {...props} />,
                code: ({node, inline, ...props}) => 
                  inline ? (
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                  ) : (
                    <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto my-3">
                      <code className="text-sm font-mono" {...props} />
                    </pre>
                  ),
                a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3" {...props} />
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Start typing your note here... You can use Markdown syntax for formatting."
            className="w-full h-full resize-none focus:outline-none bg-transparent text-gray-700 leading-relaxed"
            style={{ minHeight: '400px' }}
          />
        )}
      </div>

      {isEditing && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              You have unsaved changes
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="btn-primary px-4"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteEditor;