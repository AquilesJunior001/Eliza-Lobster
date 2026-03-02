import { Task } from "./types";
import { v4 as uuidv4 } from "uuid";

export const tasks: Task[] = [
  {
    id: uuidv4(),
    title: "Tweet about Eliza Lobster",
    description: "Create engaging tweet about Eliza Lobster AI and tag @ElizaLobster. Tweet must be authentic and generate engagement.",
    reward: 10,
    rewardToken: "USDC",
    category: "social",
    difficulty: "easy",
    timeLimit: 60,
    createdAt: new Date(),
    isActive: true
  },
  {
    id: uuidv4(),
    title: "Deploy on Solana Devnet",
    description: "Deploy a simple contract or application on Solana's devnet and share transaction hash.",
    reward: 50,
    rewardToken: "SOL",
    category: "development",
    difficulty: "medium",
    timeLimit: 120,
    createdAt: new Date(),
    isActive: true
  },
  {
    id: uuidv4(),
    title: "Create Eliza Lobster Guide",
    description: "Write a comprehensive guide on using Eliza Lobster for bounty collection. Minimum 500 words.",
    reward: 100,
    rewardToken: "USDC",
    category: "content",
    difficulty: "hard",
    timeLimit: 240,
    createdAt: new Date(),
    isActive: true
  }
];

/**
 * Get all active tasks
 */
export function getActiveTasks(): Task[] {
  return tasks.filter(task => task.isActive);
}

/**
 * Get task by ID
 */
export function getTaskById(taskId: string): Task | undefined {
  return tasks.find(task => task.id === taskId);
}

/**
 * Get tasks by category
 */
export function getTasksByCategory(category: string): Task[] {
  return tasks.filter(task => task.isActive && task.category === category);
}

/**
 * Get tasks by difficulty
 */
export function getTasksByDifficulty(difficulty: "easy" | "medium" | "hard"): Task[] {
  return tasks.filter(task => task.isActive && task.difficulty === difficulty);
}