import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import bs58 from "bs58";

// Validate environment variables
if (!process.env.SOLANA_RPC) {
  throw new Error("SOLANA_RPC environment variable is required");
}
if (!process.env.TREASURY_PRIVATE_KEY) {
  throw new Error("TREASURY_PRIVATE_KEY environment variable is required");
}

const connection = new Connection(process.env.SOLANA_RPC, "confirmed");
let treasury: Keypair;

try {
  treasury = Keypair.fromSecretKey(
    bs58.decode(process.env.TREASURY_PRIVATE_KEY)
  );
} catch (error) {
  throw new Error("Invalid TREASURY_PRIVATE_KEY format");
}

const USDC_MINT = new PublicKey("EPjFWaLb3K6L5ADVf3uJNekuCbHL7bo7jkXxvEz7QkS"); // Mainnet USDC

/**
 * Validate Solana wallet address
 */
export function validateWallet(wallet: string): boolean {
  try {
    const publicKey = new PublicKey(wallet);
    return PublicKey.isOnCurve(publicKey.toBuffer());
  } catch {
    return false;
  }
}

/**
 * Send SOL tokens
 */
export async function sendSol(wallet: string, amount: number): Promise<string> {
  try {
    if (!validateWallet(wallet)) {
      throw new Error("Invalid wallet address");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const recipientPublicKey = new PublicKey(wallet);
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

    console.log(`[SOL Payout] Sending ${amount} SOL to ${wallet}`);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: treasury.publicKey,
        toPubkey: recipientPublicKey,
        lamports: lamports
      })
    );

    const txHash = await sendAndConfirmTransaction(
      connection,
      transaction,
      [treasury],
      { commitment: "confirmed" }
    );

    console.log(`[SOL Payout] Success: ${txHash}`);
    return txHash;
  } catch (error) {
    const err = error as Error;
    console.error(`[SOL Payout Error] ${err.message}`);
    throw error;
  }
}

/**
 * Send USDC tokens
 */
export async function sendUsdc(wallet: string, amount: number): Promise<string> {
  try {
    if (!validateWallet(wallet)) {
      throw new Error("Invalid wallet address");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const recipientPublicKey = new PublicKey(wallet);
    const amountInSmallestUnit = Math.floor(amount * 1e6); // USDC has 6 decimals

    console.log(`[USDC Payout] Sending ${amount} USDC to ${wallet}`);

    // Get Associated Token Accounts
    const fromATA = await getAssociatedTokenAddress(
      USDC_MINT,
      treasury.publicKey
    );
    const toATA = await getAssociatedTokenAddress(
      USDC_MINT,
      recipientPublicKey
    );

    const transaction = new Transaction().add(
      createTransferInstruction(
        fromATA,
        toATA,
        treasury.publicKey,
        amountInSmallestUnit,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const txHash = await sendAndConfirmTransaction(
      connection,
      transaction,
      [treasury],
      { commitment: "confirmed" }
    );

    console.log(`[USDC Payout] Success: ${txHash}`);
    return txHash;
  } catch (error) {
    const err = error as Error;
    console.error(`[USDC Payout Error] ${err.message}`);
    throw error;
  }
}

/**
 * Check treasury balance
 */
export async function checkTreasuryBalance(): Promise<{ sol: number; usdc: number }> {
  try {
    const solBalance = await connection.getBalance(treasury.publicKey);
    const solAmount = solBalance / LAMPORTS_PER_SOL;
    
    // TODO: Add USDC balance check
    const usdcAmount = 0;

    console.log(`[Treasury] SOL: ${solAmount}, USDC: ${usdcAmount}`);
    return { sol: solAmount, usdc: usdcAmount };
  } catch (error) {
    const err = error as Error;
    console.error(`[Treasury Balance Error] ${err.message}`);
    throw error;
  }
}