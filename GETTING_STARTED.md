# Getting Started with Eliza Lobster

Complete beginner's guide to set up and use the Eliza Lobster bounty system.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Server](#running-the-server)
5. [Testing the API](#testing-the-api)
6. [Common Issues](#common-issues)

---

## Prerequisites

### What You Need
1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org
   - Check: `node --version`

2. **npm** (comes with Node.js)
   - Check: `npm --version`

3. **Git** (optional but recommended)
   - Download: https://git-scm.com

4. **Solana Wallet** with SOL/USDC
   - Create: https://phantom.app
   - Get testnet SOL: https://faucet.solana.com

5. **Text Editor or IDE**
   - VS Code: https://code.visualstudio.com
   - Any editor works!

---

## Installation

### Step 1: Clone the Repository

```bash
# Using Git
git clone https://github.com/yourusername/eliza-lobster.git
cd eliza-lobster

# Or download and extract the ZIP file
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages:
- Express (web server)
- Solana Web3.js (blockchain)
- TypeScript (type safety)
- And more...

### Step 3: Verify Installation

```bash
npm --version
node --version
```

---

## Configuration

### Step 1: Create Environment File

Create a file named `.env` in the project root:

```bash
# Linux/Mac
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

### Step 2: Set Up Your Solana Wallet

#### Option A: Using Phantom Wallet (Easiest)

1. Install Phantom Chrome extension: https://phantom.app
2. Create a new wallet or import existing
3. Save your recovery phrase securely
4. Fund with SOL (1-2 SOL for testing)

#### Option B: Using Solana CLI (Advanced)

```bash
# Install Solana CLI (if not already installed)
# macOS/Linux
sh -c "$(curl -sSfL https://release.solana.com/v1.18.2/install)"

# Generate new keypair
solana-keygen new --outfile treasury.json

# View the public key
solana-keygen pubkey treasury.json

# Request airdrop on devnet
solana airdrop 2 -u devnet $(solana-keygen pubkey treasury.json)
```

### Step 3: Extract Private Key

#### From Solana CLI
```bash
# On macOS/Linux
cat treasury.json | sed 's/\[//;s/\]//' | tr ',' '\n' | paste -sd '' | base64 -D | xxd -p -r | base58 -

# Or use Node.js
node -e "
const fs = require('fs');
const bs58 = require('bs58');
const keyfile = JSON.parse(fs.readFileSync('treasury.json'));
const secret = Buffer.from(keyfile.slice(0, 32));
console.log(bs58.encode(secret));
"
```

#### From Phantom
1. Open Phantom → Settings → Reveal Private Key
2. Copy the private key
3. The key is already in the correct format

### Step 4: Update .env File

Edit `.env` with your values:

```env
# For testing on devnet
SOLANA_RPC=https://api.devnet.solana.com

# For production on mainnet
SOLANA_RPC=https://api.mainnet-beta.solana.com

# Your treasury private key (Base58 format)
TREASURY_PRIVATE_KEY=YourPrivateKeyHere

# Server port
PORT=3000
NODE_ENV=development
```

### Step 5: Verify Configuration

```bash
# Never commit .env file!
# Add to .gitignore (should already be there)
echo ".env" >> .gitignore
```

---

## Running the Server

### Development Mode (with Hot Reload)

```bash
npm run dev
```

You should see:
```
[2024-03-02T10:00:00Z] GET /health
🦞 Eliza Lobster running on port 3000
Environment: development
Health check: http://localhost:3000/health
```

### Production Mode

```bash
# Build first
npm run build

# Then run
npm start
```

### In VS Code

1. Open the project folder
2. Press `Ctrl + ~` to open terminal
3. Run `npm run dev`
4. See logs in the terminal

---

## Testing the API

### Test 1: Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "eliza-lobster",
  "timestamp": "2024-03-02T10:00:00Z"
}
```

### Test 2: Get All Tasks

```bash
curl http://localhost:3000/api/tasks
```

Expected response (sample):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Tweet about Eliza Lobster",
      "description": "Create engaging tweet...",
      "reward": 10,
      "rewardToken": "USDC",
      "category": "social",
      "difficulty": "easy",
      "timeLimit": 60,
      "createdAt": "2024-03-02T10:00:00Z",
      "isActive": true
    }
  ],
  "timestamp": "2024-03-02T10:00:00Z"
}
```

### Test 3: Request a Bounty

```bash
curl -X POST http://localhost:3000/api/bounties/request \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "taskId": "550e8400-e29b-41d4-a716-446655440000",
    "wallet": "9B5X76QSPSLvz4YEKMHzKjK8n3RQcZhdKCdR4YYScah8"
  }'
```

### Test 4: Complete Bounty (Requires Fund)

This requires your treasury wallet to have SOL/USDC balance.

```bash
curl -X POST http://localhost:3000/api/bounties/complete \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "taskId": "550e8400-e29b-41d4-a716-446655440000",
    "wallet": "9B5X76QSPSLvz4YEKMHzKjK8n3RQcZhdKCdR4YYScah8",
    "proofUrl": "https://example.com/proof"
  }'
```

### Using Postman

1. Download Postman: https://www.postman.com/downloads
2. Create a new request
3. Set URL: `http://localhost:3000/api/tasks`
4. Click "Send"

### Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create new request
3. Enter URL and method
4. Click Send

---

## Troubleshooting

### Issue: "Cannot find module 'express'"

**Solution:**
```bash
npm install
```

Make sure all dependencies are installed.

### Issue: "Invalid TREASURY_PRIVATE_KEY format"

**Causes:**
- Private key not in Base58 format
- Incorrect encoding
- Copy-paste errors (extra spaces)

**Solution:**
1. Regenerate private key: `solana-keygen new --outfile treasury.json`
2. Encode properly using Node.js
3. Copy entire key without spaces

### Issue: "Invalid wallet address"

**Cause:** Wallet address format is incorrect

**Solution:**
- Phantom: Click on address to copy (auto-formatted)
- CLI: Use `solana-keygen pubkey treasury.json`
- Verify address length: 44-45 characters
- Use only letters and numbers (no special chars)

### Issue: "Account not found [9B5X76Q...]"

**Cause:** Treasury wallet has no funds for payout

**Solution:**
```bash
# Devnet airdrop
solana airdrop 2 -u devnet YourTreasuryAddress

# Mainnet: Transfer SOL/USDC to treasury address
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Use different port
PORT=3001 npm run dev

# Or kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell):
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "SOLANA_RPC environment variable is required"

**Solution:**
1. Create `.env` file
2. Add `SOLANA_RPC=https://api.devnet.solana.com`
3. Restart server

### Issue: Slow transactions or timeouts

**Solution:**
1. Check RPC endpoint status
2. Try different RPC provider:
   ```bash
   # Helius (free tier available)
   SOLANA_RPC=https://devnet.helius-rpc.com/

   # QuickNode (free trial)
   SOLANA_RPC=https://solana-devnet.quiknode.pro/
   ```
3. Increase timeout in code (advanced)

---

## Development Tips

### 1. Enable TypeScript Checking

```bash
# Check for TypeScript errors
npx tsc --noEmit
```

### 2. View Real-time Logs

```bash
npm run dev 2>&1 | tee logs.txt
```

### 3. Test with Sample Wallet (Devnet)

```bash
# Create test wallet
solana-keygen new --outfile test-wallet.json

# Get test SOL
solana airdrop 2 -u devnet $(solana-keygen pubkey test-wallet.json)

# Extract private key and use in requests
```

### 4. Monitor Transactions

1. Go to Solscan: https://solscan.io
2. Paste transaction hash
3. View details and confirmations

### 5. Add Debug Logging

Edit `src/routes.ts`:
```typescript
console.log('[DEBUG] Bounty request:', req.body);
```

---

## Next Steps

1. **Add Database**: Replace in-memory storage with MongoDB/PostgreSQL
2. **Add Authentication**: Implement JWT or API keys
3. **Add Rate Limiting**: Prevent abuse
4. **Add Admin Panel**: Manage tasks and payouts
5. **Deploy to Production**: Use Railway.app, Heroku, or AWS
6. **Mobile App**: Build React Native or Flutter client

---

## Additional Resources

### Solana Documentation
- Official Docs: https://docs.solana.com
- Web3.js: https://solana-labs.github.io/solana-web3.js/
- SPL Token: https://spl.solana.com/token

### Blockchain Explorers
- **Mainnet**: https://solscan.io
- **Devnet**: https://solscan.io?cluster=devnet
- **Testnet**: https://solscan.io?cluster=testnet

### Tools
- **Phantom Wallet**: https://phantom.app
- **Solana CLI**: https://docs.solana.com/cli
- **Postman**: https://www.postman.com

### Faucets (Get Free SOL)
- **Devnet**: https://faucet.solana.com
- **Testnet**: https://faucet.solana.com

---

## Support

Having issues? 
1. Check the [README.md](README.md)
2. Review error messages carefully
3. Check [API.md](API.md) for endpoint details
4. Create GitHub issue with error details

Happy bounty hunting! 🦞
