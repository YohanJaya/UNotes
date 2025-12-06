import React, { useState } from 'react';
import { Bot, Sparkles, X, Send, Zap, Wand2 } from 'lucide-react';

const AIAssistant = ({ onClose, currentNote, onApplySuggestion }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('improve');

  const suggestions = [
    {
      title: 'Improve Writing',
      description: 'Enhance grammar and clarity',
      icon: <Sparkles size={20} />,
      prompt: 'Improve the writing style and grammar of this note:'
    },
    {
      title: 'Summarize',
      description: 'Create a concise summary',
      icon: <Zap size={20} />,
      prompt: 'Summarize this note in bullet points:'
    },
    {
      title: 'Expand Ideas',
      description: 'Add more details and examples',
      icon: <Wand2 size={20} />,
      prompt: 'Expand on these ideas with more details:'
    },
    {
      title: 'Fix Formatting',
      description: 'Clean up markdown formatting',
      icon: <Sparkles size={20} />,
      prompt: 'Fix the markdown formatting of this note:'
    }
  ];

  const handleSuggestionClick = (suggestionPrompt) => {
    setPrompt(suggestionPrompt + ' ' + currentNote?.content.substring(0, 200) + '...');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    
    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const responses = [
        "Here's an improved version of your note:\n\n" + 
        "## Enhanced Version\n" +
        "This is a professionally rewritten version of your content with better structure and clarity.\n\n" +
        "### Key Improvements:\n" +
        "- Improved sentence structure\n" +
        "- Enhanced readability\n" +
        "- Better organization\n" +
        "- Professional tone",
        
        "Summary:\n\n" +
        "• Main points covered in the note\n" +
        "• Key takeaways and insights\n" +
        "• Action items and next steps\n" +
        "• Important deadlines or dates",
        
        "Expanded version with more details:\n\n" +
        "Let me elaborate on your ideas with additional context, examples, and supporting information to make your note more comprehensive and actionable.",
        
        "Formatted version:\n\n" +
        "I've cleaned up the markdown formatting to ensure proper headings, lists, and code blocks for better readability and presentation."
      ];
      
      setResponse(responses[Math.floor(Math.random() * responses.length)]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">AI Assistant</h2>
              <p className="text-sm text-gray-600">Get help with writing, formatting, and improving your notes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Suggestions */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="font-semibold text-gray-700 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.prompt)}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-blue-600">
                      {suggestion.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{suggestion.title}</h4>
                      <p className="text-sm text-gray-600">{suggestion.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-gray-700 mb-3">Current Note</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 truncate">{currentNote?.title || 'No note selected'}</h4>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  {currentNote?.content?.substring(0, 150) || 'Select a note to use AI features'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Chat */}
          <div className="flex-1 flex flex-col p-6">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {prompt && (
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-br-none px-4 py-3 max-w-[80%]">
                    {prompt}
                  </div>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              ) : response ? (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot size={20} className="text-white" />
                    </div>
                    <div className="bg-gray-50 rounded-2xl rounded-bl-none px-4 py-3 flex-1">
                      <div className="prose prose-sm max-w-none">
                        {response.split('\n').map((line, i) => (
                          <p key={i} className="my-1">{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {response && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => onApplySuggestion(response)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Sparkles size={16} />
                        <span>Apply to Note</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <Bot size={32} className="text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    How can I help you today?
                  </h3>
                  <p className="text-gray-500">
                    Ask me to improve, summarize, or expand your notes
                  </p>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask AI to improve, summarize, or expand your note..."
                  className="input-field flex-1"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className={`btn-primary flex items-center space-x-2 ${
                    isLoading || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Send size={18} />
                  <span>Send</span>
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                AI suggestions are powered by machine learning and may require review
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;