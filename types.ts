
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface VerilogProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  initialCode: string;
}

export interface VerificationResult {
  isCorrect: boolean;
  feedback: string;
  optimizationTips?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface UserProgress {
  problemId: string;
  status: 'solved' | 'attempted' | 'unseen';
  lastCode: string;
  lastResult: VerificationResult | null;
  chatHistory: ChatMessage[];
  timestamp: number;
}
