import React, { useState } from 'react';
import { VerilogProblem, Difficulty } from '../types';
import { Clock, X, Code2, Library, Sparkles, Search, CheckCircle2, Circle } from 'lucide-react';

interface HistorySidebarProps {
  history: VerilogProblem[];
  library: VerilogProblem[];
  currentId: string | undefined;
  onSelect: (problem: VerilogProblem) => void;
  isOpen: boolean;
  onClose: () => void;
  statusMap: Record<string, 'solved' | 'attempted' | 'unseen'>;
}

const DifficultyBadge = ({ level }: { level: Difficulty }) => {
  const colors = {
    Easy: 'text-green-400 bg-green-500/10 border-green-500/20',
    Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    Hard: 'text-red-400 bg-red-500/10 border-red-500/20',
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${colors[level]}`}>
      {level}
    </span>
  );
};

const StatusIcon = ({ status }: { status?: 'solved' | 'attempted' | 'unseen' }) => {
  if (status === 'solved') {
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  }
  if (status === 'attempted') {
    return <div className="w-3.5 h-3.5 rounded-full border-2 border-yellow-500/50" />;
  }
  return <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-800" />;
};

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
    history, 
    library, 
    currentId, 
    onSelect, 
    isOpen, 
    onClose,
    statusMap
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'history'>('library');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLibrary = library.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = history.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-[#09090b] border-r border-zinc-800 flex flex-col h-full shrink-0 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 bg-[#09090b]">
        <div className="flex items-center space-x-2 text-zinc-100 font-semibold">
          <Code2 className="w-5 h-5 text-indigo-400" />
          <span>Verilog IDE</span>
        </div>
        <button 
            onClick={onClose} 
            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button 
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors relative ${
            activeTab === 'library' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>Problem Set</span>
          {activeTab === 'library' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors relative ${
            activeTab === 'history' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className="relative">
            <Sparkles className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          </div>
          <span>Generated</span>
          {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
        </button>
      </div>
      
      {/* Search */}
      <div className="p-3 border-b border-zinc-800 bg-[#0c0c0e]">
        <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
            <input 
                type="text" 
                placeholder="Search questions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#18181b] border border-zinc-700 rounded-md py-2 pl-9 pr-4 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50"
            />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#09090b]">
        {activeTab === 'library' ? (
            // Library List
            <div className="p-2 space-y-1">
                {filteredLibrary.map((problem) => (
                    <ProblemItem 
                        key={problem.id} 
                        problem={problem} 
                        isActive={currentId === problem.id} 
                        status={statusMap[problem.id]}
                        onSelect={onSelect}
                        showTime={false}
                    />
                ))}
            </div>
        ) : (
            // History List
            <div className="p-2 space-y-1">
                {filteredHistory.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center text-zinc-600 text-sm px-4 text-center">
                        <HistoryIcon className="w-8 h-8 mb-3 opacity-20" />
                        <p>No generated history.</p>
                        <p className="text-xs mt-1 text-zinc-500">Use the "Generate" button to create unique AI problems!</p>
                    </div>
                ) : (
                    [...filteredHistory].reverse().map((problem) => (
                        <ProblemItem 
                            key={problem.id} 
                            problem={problem} 
                            isActive={currentId === problem.id}
                            status={statusMap[problem.id]} 
                            onSelect={onSelect}
                            showTime={true}
                        />
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  );
};

const HistoryIcon = ({className}: {className: string}) => (
    <Clock className={className} />
)

interface ProblemItemProps {
    problem: VerilogProblem;
    isActive: boolean;
    onSelect: (p: VerilogProblem) => void;
    showTime: boolean;
    status?: 'solved' | 'attempted' | 'unseen';
}

const ProblemItem: React.FC<ProblemItemProps> = ({ 
    problem, 
    isActive, 
    onSelect,
    showTime,
    status
}) => (
    <button
      onClick={() => onSelect(problem)}
      className={`w-full text-left px-3 py-3 rounded-md border transition-all group relative ${
        isActive 
          ? 'bg-zinc-800/80 border-indigo-500/30' 
          : 'bg-transparent border-transparent hover:bg-zinc-800/50'
      }`}
    >
      <div className="flex justify-between items-start mb-1.5 gap-2">
         <span className={`text-sm font-medium leading-tight truncate ${isActive ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
           {problem.title}
         </span>
         {showTime ? (
            <span className="text-[10px] text-zinc-600 font-mono whitespace-nowrap pt-0.5">
                {new Date(parseInt(problem.id) || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
         ) : (
             <StatusIcon status={status} />
         )}
      </div>
      <div className="flex items-center gap-2">
        <DifficultyBadge level={problem.difficulty} />
        <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">
            {problem.id.startsWith('static') ? 'Standard' : 'AI Gen'}
        </span>
      </div>
    </button>
);

export default HistorySidebar;