import React from 'react';
import { VerilogProblem, Difficulty } from '../types';
import { BookOpen, Cpu, AlertCircle } from 'lucide-react';

interface ProblemPanelProps {
  problem: VerilogProblem | null;
  loading: boolean;
}

const DifficultyBadge = ({ level }: { level: Difficulty }) => {
  const colors = {
    Easy: 'bg-green-500/10 text-green-400 border-green-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Hard: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[level]}`}>
      {level}
    </span>
  );
};

const ProblemPanel: React.FC<ProblemPanelProps> = ({ problem, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4 animate-pulse">
        <Cpu className="w-12 h-12" />
        <p>Generating silicon challenge...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <BookOpen className="w-12 h-12 mb-4 opacity-50" />
        <p>Select a difficulty to generate a problem.</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto text-zinc-300">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">{problem.title}</h2>
      </div>

      <div className="flex items-center space-x-4 mb-6">
         <DifficultyBadge level={problem.difficulty} />
         <span className="text-xs text-zinc-500 uppercase tracking-wider">Verilog 2005</span>
      </div>

      <div className="prose prose-invert prose-sm max-w-none">
        <div className="whitespace-pre-wrap leading-relaxed">
            {problem.description}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-200">
            <p className="font-semibold mb-1">Tip</p>
            Make sure your module interface matches the initial code exactly. The AI verifier uses this to check your solution.
        </div>
      </div>
    </div>
  );
};

export default ProblemPanel;
