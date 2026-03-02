export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  rewardToken: "SOL" | "USDC";
  category: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit?: number; // in minutes
  createdAt: Date;
  isActive: boolean;
}

export interface Bounty {
  taskId: string;
  userId: string;
  wallet: string;
  status: "pending" | "completed" | "verified" | "paid";
  reward: number;
  rewardToken: "SOL" | "USDC";
  transactionHash?: string;
  completedAt?: Date;
  submittedAt?: Date;
}

export interface PayoutResult {
  success: boolean;
  transactionHash: string;
  wallet: string;
  amount: number;
  token: string;
  timestamp: Date;
  confirmations?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}