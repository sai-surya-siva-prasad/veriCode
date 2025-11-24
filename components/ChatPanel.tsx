import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Sparkles, Eraser, Lightbulb, BookOpen } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  onHint: () => void;
  onExplain: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages, 
  onSendMessage, 
  loading, 
  isOpen, 
  onClose,
  onClear,
  onHint,
  onExplain
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-96 bg-[#09090b] border-l border-zinc-800 flex flex-col h-full shrink-0 shadow-xl animate-in slide-in-from-right duration-200 absolute right-0 top-0 bottom-0 z-30 md:relative">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 bg-[#09090b] shrink-0">
        <div className="flex items-center space-x-2 text-zinc-100 font-semibold">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>AI Tutor</span>
        </div>
        <div className="flex items-center space-x-1">
            <button 
                onClick={onClear}
                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Clear Chat"
            >
                <Eraser className="w-4 h-4" />
            </button>
            <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0c0c0e]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
             <div className="opacity-60 flex flex-col items-center">
                <Bot className="w-12 h-12 mb-3" />
                <div className="text-center px-6">
                  <p className="text-sm font-medium text-zinc-400">Verilog Assistant</p>
                  <p className="text-xs mt-1 text-zinc-500">Ask about syntax, logic, or debugging.</p>
                </div>
             </div>

             <div className="flex gap-2 w-full px-6">
                <button 
                    onClick={onHint}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-xs font-medium text-zinc-300 transition-colors group"
                >
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-500/70 group-hover:text-yellow-400" />
                    Get Hint
                </button>
                <button 
                    onClick={onExplain}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-xs font-medium text-zinc-300 transition-colors group"
                >
                    <BookOpen className="w-3.5 h-3.5 text-blue-500/70 group-hover:text-blue-400" />
                    Explain
                </button>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
            )}
            
            <div 
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
              }`}
            >
              {msg.text}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
            )}
          </div>
        ))}

        {loading && (
           <div className="flex space-x-3 justify-start animate-pulse">
             <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="bg-zinc-800 rounded-lg px-4 py-2 flex items-center space-x-1 border border-zinc-700">
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[#09090b] border-t border-zinc-800 shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="w-full bg-[#18181b] text-zinc-200 text-sm rounded-lg pl-4 pr-10 py-3 border border-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 p-1 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;