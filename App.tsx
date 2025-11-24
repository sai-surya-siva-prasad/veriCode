import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Cpu, Code2, ChevronDown, Sparkles, Menu, MessageSquare, LogIn } from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import ProblemPanel from './components/ProblemPanel';
import OutputConsole from './components/OutputConsole';
import HistorySidebar from './components/HistorySidebar';
import ChatPanel from './components/ChatPanel';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import { generateProblem, verifySolution, getChatResponse } from './services/geminiService';
import { STATIC_PROBLEMS } from './services/questionBank';
import { 
    loginUser, 
    logoutUser, 
    subscribeToAuthChanges, 
    saveUserProgress, 
    getUserProgress, 
    getAllUserProgress, 
    getUserStats 
} from './services/userService';
import { VerilogProblem, VerificationResult, Difficulty, ChatMessage, User, UserProgress } from './types';

const App: React.FC = () => {
  // User & Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProgressMap, setUserProgressMap] = useState<Record<string, UserProgress>>({});
  const [userStats, setUserStats] = useState({ totalSolved: 0, totalAttempted: 0, recentActivity: [] as any[] });

  // Core App State
  const [currentProblem, setCurrentProblem] = useState<VerilogProblem | null>(null);
  const [code, setCode] = useState<string>('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Sidebar State
  const [problemHistory, setProblemHistory] = useState<VerilogProblem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // 1. Authentication Listener (Firebase is Async)
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (authUser) => {
        setUser(authUser);
        if (authUser) {
            // Load user data when they log in
            const progress = await getAllUserProgress(authUser.id);
            setUserProgressMap(progress);
            
            // Refresh stats
            const stats = await getUserStats(authUser.id);
            setUserStats(stats);

            // If a problem is currently selected, try to reload the state for it
            if (currentProblem && progress[currentProblem.id]) {
                const p = progress[currentProblem.id];
                setCode(p.lastCode);
                setResult(p.lastResult);
                setChatMessages(p.chatHistory);
            }
        } else {
            // Clear user data on logout
            setUserProgressMap({});
            setUserStats({ totalSolved: 0, totalAttempted: 0, recentActivity: [] });
        }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProblem?.id]); // Re-run if problem changes just to ensuring syncing, though mostly auth driven

  // 2. Initial Problem Load
  useEffect(() => {
    if (STATIC_PROBLEMS.length > 0) {
      handleSelectProblem(STATIC_PROBLEMS[0]);
    } else {
      handleNewProblem('Easy');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. Persist Progress (Debounced)
  useEffect(() => {
    if (!currentProblem || !user) return;

    const timer = setTimeout(() => {
      const status = result?.isCorrect ? 'solved' : (result ? 'attempted' : 'unseen');
      
      const currentProgress = userProgressMap[currentProblem.id];
      let newStatus = status;
      // Don't downgrade status
      if (currentProgress?.status === 'solved') newStatus = 'solved';
      else if (currentProgress?.status === 'attempted' && status === 'unseen') newStatus = 'attempted';

      const progress: UserProgress = {
        problemId: currentProblem.id,
        status: newStatus as 'solved' | 'attempted' | 'unseen',
        lastCode: code,
        lastResult: result,
        chatHistory: chatMessages,
        timestamp: Date.now()
      };

      // Optimistic update
      setUserProgressMap(prev => ({ ...prev, [currentProblem.id]: progress }));
      
      // Fire and forget save
      saveUserProgress(user.id, progress);
    }, 2000); // Save every 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [code, result, chatMessages, currentProblem, user]);

  const handleLogin = async () => {
    // The actual login logic is handled by signInWithPopup in userService.
    // The state update happens in the useEffect listener above.
    await loginUser();
  };

  const handleLogout = async () => {
    await logoutUser();
    setIsProfileModalOpen(false);
  };

  const handleNewProblem = async (diff: Difficulty) => {
    setLoading(true);
    setIsDropdownOpen(false);
    setDifficulty(diff);
    setResult(null);
    setChatMessages([]); 
    
    try {
      const problem = await generateProblem(diff);
      const uniqueProblem = { ...problem, id: Date.now().toString() };
      
      setProblemHistory(prev => [...prev, uniqueProblem]);
      setCurrentProblem(uniqueProblem);
      setCode(problem.initialCode);
      
      // Initialize chat
      setChatMessages([
        { role: 'model', text: `Hi! I'm ready to help you with "${problem.title}".\n\nAsk me for a hint if you get stuck!` }
      ]);
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProblem = async (problem: VerilogProblem) => {
    if (currentProblem?.id === problem.id) return;
    
    setCurrentProblem(problem);

    // Try to load from local cache first
    if (user && userProgressMap[problem.id]) {
       const saved = userProgressMap[problem.id];
       setCode(saved.lastCode);
       setResult(saved.lastResult);
       setChatMessages(saved.chatHistory);
       return;
    }

    // If needed, we could fetch specifically for this problem from DB here if cache missed,
    // but for now we rely on the bulk fetch at login.

    // Default Reset
    setCode(problem.initialCode);
    setResult(null);
    setChatMessages([
        { role: 'model', text: `Hi! I'm ready to help you with "${problem.title}".\n\nAsk me for a hint if you get stuck!` }
    ]);
  };

  const handleRunCode = async () => {
    if (!currentProblem) return;
    
    if (!user) {
         // Optionally prompt for login here
    }

    setVerifying(true);
    setResult(null);
    try {
      const res = await verifySolution(currentProblem, code);
      setResult(res);
      
      // If user is logged in, stats will update on next refresh or we can manually refetch,
      // but strictly speaking the ProfileModal fetches on render/open usually or we can rely on local state.
      if (user && res.isCorrect) {
          // Quick update to local stats for immediate feedback in UI if we were displaying counters
      }

    } catch (error) {
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = () => {
    if (currentProblem) {
      setCode(currentProblem.initialCode);
      setResult(null);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!currentProblem) return;
    
    const newUserMsg: ChatMessage = { role: 'user', text };
    setChatMessages(prev => [...prev, newUserMsg]);
    setChatLoading(true);

    try {
      const responseText = await getChatResponse(chatMessages, currentProblem, code, text);
      const newAiMsg: ChatMessage = { role: 'model', text: responseText };
      setChatMessages(prev => [...prev, newAiMsg]);
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleQuickAction = (action: 'hint' | 'explain') => {
      if (!isChatOpen) setIsChatOpen(true);
      if (action === 'hint') {
          handleSendMessage("Can you give me a small hint for this problem without showing the code?");
      } else {
          handleSendMessage("Can you explain the problem requirements in simple terms?");
      }
  };

  return (
    <div className="h-screen w-screen bg-[#09090b] text-white flex flex-col overflow-hidden font-sans">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin} 
      />
      
      {user && (
        <ProfileModal 
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={user}
            stats={userStats}
            onLogout={handleLogout}
        />
      )}

      {/* Navbar */}
      <header className="h-14 border-b border-zinc-800 bg-[#09090b] flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center space-x-4">
          <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className={`p-2 rounded-md transition-colors ${isSidebarOpen ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
             title="Toggle Sidebar"
          >
             <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hidden sm:inline-block">
              VeriCode AI
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
            <div className="relative">
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors text-zinc-300 border border-zinc-800 hover:border-zinc-700"
                >
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="hidden sm:inline">Generate: {difficulty}</span>
                    <span className="sm:hidden">Generate</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full mt-1 right-0 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-50">
                        {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                            <button
                                key={d}
                                onClick={() => handleNewProblem(d)}
                                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${isChatOpen ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'text-zinc-300 border-zinc-800 hover:bg-zinc-800'}`}
            >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">AI Tutor</span>
            </button>

            <div className="h-6 w-px bg-zinc-800 mx-2 hidden sm:block"></div>
            
            {/* Run Button */}
            <button
                onClick={handleRunCode}
                disabled={verifying || loading || !currentProblem}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    verifying 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                }`}
            >
                <Play className="w-4 h-4 fill-current" />
                <span>{verifying ? 'Verifying...' : 'Submit'}</span>
            </button>

            {/* Auth Button */}
            {user ? (
                 <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center justify-center rounded-full overflow-hidden border border-zinc-700 hover:border-zinc-500 transition-all ml-2"
                 >
                     <img src={user.avatarUrl} alt="User" className="w-8 h-8" />
                 </button>
            ) : (
                <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors text-zinc-300 ml-2"
                >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden md:inline">Sign In</span>
                </button>
            )}
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar */}
        <HistorySidebar 
            library={STATIC_PROBLEMS}
            history={problemHistory}
            currentId={currentProblem?.id}
            onSelect={handleSelectProblem}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            progressMap={userProgressMap}
        />

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
            {/* Left Panel: Problem & Console */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-800 max-w-[50%]">
            
            {/* Problem Description Area */}
            <div className="flex-1 overflow-hidden bg-[#0c0c0e]">
                <ProblemPanel problem={currentProblem} loading={loading} />
            </div>

            {/* Console / Output Area */}
            <div className="h-1/3 border-t border-zinc-800 bg-[#0c0c0e] flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 bg-[#18181b] border-b border-zinc-800">
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Verification Console</span>
                </div>
                <div className="flex-1 overflow-hidden">
                    <OutputConsole result={result} isVerifying={verifying} />
                </div>
            </div>

            </div>

            {/* Right Panel: Editor & Chat */}
            <div className="flex-1 flex min-w-0 bg-[#1e1e1e] relative">
                {/* Editor Container */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-zinc-700">
                        <div className="flex items-center space-x-2 text-zinc-400">
                            <Code2 className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">solution.v</span>
                        </div>
                        <button 
                            onClick={handleReset}
                            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
                            title="Reset Code"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <CodeEditor 
                            code={code} 
                            onChange={setCode} 
                        />
                    </div>
                </div>

                {/* Chat Panel (Collapsible) */}
                <ChatPanel 
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    onHint={() => handleQuickAction('hint')}
                    onExplain={() => handleQuickAction('explain')}
                    loading={chatLoading}
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    onClear={() => setChatMessages([])}
                />
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;