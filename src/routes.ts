import express, { Request, Response } from "express";
import {
  getActiveTasks,
  getTaskById,
  getTasksByCategory,
  getTasksByDifficulty
} from "./tasks";
import { sendSol, sendUsdc, validateWallet } from "./solanaPayout";
import { ApiResponse, Bounty } from "./types";

const router = express.Router();

// Track bounties (in production, use database)
const bountiesStore = new Map<string, Bounty>();

/**
 * GET /api/tasks - Get all active tasks
 */
router.get("/tasks", (req: Request, res: Response) => {
  try {
    const tasks = getActiveTasks();
    const response: ApiResponse<typeof tasks> = {
      success: true,
      data: tasks,
      timestamp: new Date()
    };
    res.json(response);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/tasks/:taskId - Get specific task
 */
router.get("/tasks/:taskId", (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const task = getTaskById(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
        timestamp: new Date()
      });
    }
    
    const response: ApiResponse<typeof task> = {
      success: true,
      data: task,
      timestamp: new Date()
    };
    res.json(response);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/tasks/category/:category - Get tasks by category
 */
router.get("/tasks/category/:category", (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const tasks = getTasksByCategory(category);
    
    const response: ApiResponse<typeof tasks> = {
      success: true,
      data: tasks,
      timestamp: new Date()
    };
    res.json(response);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/bounties/request - Request a task
 */
router.post("/bounties/request", (req: Request, res: Response) => {
  try {
    const { userId, taskId, wallet } = req.body;
    
    // Validation
    if (!userId || !taskId || !wallet) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userId, taskId, wallet",
        timestamp: new Date()
      });
    }
    
    if (!validateWallet(wallet)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Solana wallet address",
        timestamp: new Date()
      });
    }
    
    const task = getTaskById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
        timestamp: new Date()
      });
    }
    
    const bountyId = `${userId}-${taskId}`;
    const bounty: Bounty = {
      taskId,
      userId,
      wallet,
      status: "pending",
      reward: task.reward,
      rewardToken: task.rewardToken,
      submittedAt: new Date()
    };
    
    bountiesStore.set(bountyId, bounty);
    
    const response: ApiResponse<Bounty> = {
      success: true,
      data: bounty,
      timestamp: new Date()
    };
    res.status(201).json(response);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/bounties/complete - Complete and pay bounty
 */
router.post("/bounties/complete", async (req: Request, res: Response) => {
  try {
    const { userId, taskId, wallet, proofUrl } = req.body;
    
    // Validation
    if (!userId || !taskId || !wallet) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        timestamp: new Date()
      });
    }
    
    const task = getTaskById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
        timestamp: new Date()
      });
    }
    
    // Process payout based on token type
    let txHash: string;
    try {
      if (task.rewardToken === "SOL") {
        txHash = await sendSol(wallet, task.reward);
      } else {
        txHash = await sendUsdc(wallet, task.reward);
      }
    } catch (payoutError) {
      const err = payoutError as Error;
      return res.status(500).json({
        success: false,
        error: `Payout failed: ${err.message}`,
        timestamp: new Date()
      });
    }
    
    // Update bounty status
    const bountyId = `${userId}-${taskId}`;
    const bounty = bountiesStore.get(bountyId);
    if (bounty) {
      bounty.status = "paid";
      bounty.transactionHash = txHash;
      bounty.completedAt = new Date();
    }
    
    const response: ApiResponse<{ txHash: string; bountyId: string }> = {
      success: true,
      data: { txHash, bountyId },
      timestamp: new Date()
    };
    res.json(response);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/bounties/:userId - Get user's bounties
 */
router.get("/bounties/:userId", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userBounties = Array.from(bountiesStore.values()).filter(
      bounty => bounty.userId === userId
    );
    
    const response: ApiResponse<Bounty[]> = {
      success: true,
      data: userBounties,
      timestamp: new Date()
    };
    res.json(response);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date()
    });
  }
});

export default router;