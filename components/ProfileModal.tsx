
import React from 'react';
import { X, Trophy, Target, Clock, Zap } from 'lucide-react';
import { User } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  stats: {
    totalSolved: number;
    totalAttempted: number;
    recentActivity: any[];
  };
  onLogout: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, stats, onLogout }) => {
  if (!isOpen) return null;

  const solveRate = stats.totalAttempted > 0 
    ? Math.round((stats.totalSolved / stats.totalAttempted) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        <div className="h-32 bg-gradient-to-r from-indigo-900 to-purple-900 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6 flex items-end justify-between">
            <div className="flex items-end">
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-24 h-24 rounded-2xl border-4 border-[#09090b] bg-[#18181b]"
              />
              <div className="ml-4 mb-2">
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-zinc-400 text-sm">{user.email}</p>
              </div>
            </div>
            <button
                onClick={onLogout}
                className="mb-2 text-xs font-medium text-red-400 hover:text-red-300 px-3 py-1.5 border border-red-500/20 rounded-md hover:bg-red-500/10 transition-colors"
            >
                Sign Out
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#18181b] p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center space-x-2 text-green-400 mb-2">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Solved</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalSolved}</p>
            </div>
            <div className="bg-[#18181b] p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                <Target className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Attempted</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalAttempted}</p>
            </div>
            <div className="bg-[#18181b] p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center space-x-2 text-blue-400 mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Success Rate</span>
              </div>
              <p className="text-3xl font-bold text-white">{solveRate}%</p>
            </div>
          </div>

          {/* Progress Bars (Mock visualization) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-500" />
                Recent Progress
            </h3>
            <div className="space-y-3">
                {stats.totalAttempted === 0 ? (
                    <p className="text-sm text-zinc-500 italic">No problems attempted yet.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                         <div className="flex items-center text-xs">
                             <span className="w-16 text-zinc-400">Easy</span>
                             <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden mx-3">
                                <div className="h-full bg-green-500/50 w-[75%] rounded-full" />
                             </div>
                             <span className="text-zinc-300 font-mono">75%</span>
                         </div>
                         <div className="flex items-center text-xs">
                             <span className="w-16 text-zinc-400">Medium</span>
                             <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden mx-3">
                                <div className="h-full bg-yellow-500/50 w-[30%] rounded-full" />
                             </div>
                             <span className="text-zinc-300 font-mono">30%</span>
                         </div>
                         <div className="flex items-center text-xs">
                             <span className="w-16 text-zinc-400">Hard</span>
                             <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden mx-3">
                                <div className="h-full bg-red-500/50 w-[10%] rounded-full" />
                             </div>
                             <span className="text-zinc-300 font-mono">10%</span>
                         </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
