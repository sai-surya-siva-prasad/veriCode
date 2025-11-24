import React from 'react';
import { VerificationResult } from '../types';
import { CheckCircle2, XCircle, Lightbulb, Terminal } from 'lucide-react';

interface OutputConsoleProps {
  result: VerificationResult | null;
  isVerifying: boolean;
}

const OutputConsole: React.FC<OutputConsoleProps> = ({ result, isVerifying }) => {
  if (isVerifying) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-400 space-x-3">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Running Verification Testbench...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-600">
        <Terminal className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-sm">Run your code to see output</span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className={`flex items-center space-x-2 text-sm font-bold border-b pb-3 ${result.isCorrect ? 'text-green-400 border-green-500/20' : 'text-red-400 border-red-500/20'}`}>
        {result.isCorrect ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Accepted</span>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5" />
            <span>Wrong Answer / Syntax Error</span>
          </>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Feedback</h4>
        <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-900/50 p-3 rounded border border-zinc-800">
          {result.feedback}
        </div>
      </div>

      {result.optimizationTips && (
        <div className="space-y-2 pt-2">
           <h4 className="text-xs uppercase tracking-wider text-yellow-500/80 font-semibold flex items-center gap-2">
             <Lightbulb className="w-3 h-3" /> 
             Optimization Tips
           </h4>
           <div className="text-sm text-zinc-400 italic">
             {result.optimizationTips}
           </div>
        </div>
      )}
    </div>
  );
};

export default OutputConsole;
