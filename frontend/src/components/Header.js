import React from 'react';
import { Search, Plus, Bell, User, Bot, FileText, Menu } from 'lucide-react';

const Header = ({ onSearch, onCreateNote, onToggleAI, onOpenPDF }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <button className="lg:hidden mr-3">
              <Menu size={24} />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <h1 className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              UNOTES
            </h1>
          </div>

          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search notes, tags, or content..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-96 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleAI}
              className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 hover:from-blue-100 hover:to-purple-100 transition-all"
              title="AI Assistant"
            >
              <Bot size={20} />
            </button>
            
            <button
              onClick={onOpenPDF}
              className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
              title="Open PDF"
            >
              <FileText size={20} />
            </button>
            
            <button
              onClick={onCreateNote}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span className="hidden md:inline">New Note</span>
            </button>
          </div>

          <button className="p-2 text-gray-600 hover:text-gray-800 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden cursor-pointer">
            <User className="w-full h-full p-1 text-white" />
          </div>
        </div>
      </div>
      
      <div className="mt-3 lg:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notes..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;