# Eliza Lobster API Documentation

Complete API reference for the Eliza Lobster bounty system.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, no authentication required. In production, implement JWT tokens or API keys.

---

## Endpoints

### Health Check

#### GET /health
Check if the service is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "eliza-lobster",
  "timestamp": "2024-03-02T10:00:00Z"
}
```

---

## Task Endpoints

### GET /api/tasks
Retrieve all active tasks.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Tweet about Eliza Lobster",
      "description": "Create engaging tweet about Eliza Lobster AI and tag @ElizaLobster",
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

---

### GET /api/tasks/:taskId
Get a specific task by ID.

**Parameters:**
- `taskId` (string, required): UUID of the task

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Tweet about Eliza Lobster",
    "description": "Create engaging tweet about Eliza Lobster AI and tag @ElizaLobster",
    "reward": 10,
    "rewardToken": "USDC",
    "category": "social",
    "difficulty": "easy",
    "timeLimit": 60,
    "createdAt": "2024-03-02T10:00:00Z",
    "isActive": true
  },
  "timestamp": "2024-03-02T10:00:00Z"
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Task not found",
  "timestamp": "2024-03-02T10:00:00Z"
}
```

---

### GET /api/tasks/category/:category
Get tasks filtered by category.

**Parameters:**
- `category` (string, required): Category name (social, development, content)

**Available Categories:**
- `social` - Social media engagement tasks
- `development` - Development and coding tasks
- `content` - Content creation tasks

**Response (200):**
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

---

## Bounty Endpoints

### POST /api/bounties/request
Request a bounty task. This initiates the bounty workflow.

**Request Body:**
```json
{
  "userId": "user123",
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "wallet": "9B5X76QSPSLvz4YEKMHzKjK8n3RQcZhdKCdR4YYScah8"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | Unique user identifier |
| taskId | string | Yes | Valid task UUID |
| wallet | string | Yes | Valid Solana wallet address (44-45 chars) |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "taskId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user123",
    "wallet": "9B5X76QSPSLvz4YEKMHzKjK8n3RQcZhdKCdR4YYScah8",
    "status": "pending",
    "reward": 10,
    "rewardToken": "USDC",
    "submittedAt": "2024-03-02T10:00:00Z"
  },
  "timestamp": "2024-03-02T10:00:00Z"
}
```

**Response (400 - Invalid Input):**
```json
{
  "success": false,
  "error": "Missing required fields: userId, taskId, wallet",
  "timestamp": "2024-03-02T10:00:00Z"
}
```

**Response (400 - Invalid Wallet):**
```json
{
  "success": false,
  "error": "Invalid Solana wallet address",
  "timestamp": "2024-03-02T10:00:00Z"
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Task not found",
  "timestamp": "2024-03-02T10:00:00Z"
}
```

---

### POST /api/bounties/complete
Complete a bounty and receive payout.

**Request Body:**
```json
{
  "userId": "user123",
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "wallet": "9B5X76QSPSLvz4YEKMHzKjK8n3RQcZhdKCdR4YYScah8",
  "proofUrl": "https://twitter.com/user/status/1234567890"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | Unique user identifier |
| taskId | string | Yes | Valid task UUID |
| wallet | string | Yes | Valid Solana wallet address |
| proofUrl | string | No | Link to proof of completion |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "txHash": "5KXhT6YJ8FqK2pL9nM3oQ1rS4tU5vW6xY7zA8bC9dE0FgH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0aB1cD2eE3fG4h",
    "bountyId": "user123-550e8400-e29b-41d4-a716-446655440000"
  },
  "timestamp": "2024-03-02T10:00:00Z"
}
```

**Response (400 - Missing Fields):**
```json
{
  "success": false,
  "error": "Missing required fields",
  "timestamp": "2024-03-02T10:00:00Z"
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Task not found",
  "timestamp": "2024-03-02T10:00:00Z"
}
```

**Response (500 - Payout Failed):**
```json
{
  "success": false,
  "error": "Payout failed: Account not found [9B5X76Q...]",
  "timestamp": "2024-03-02T10:00:00Z"
}
```

---

### GET /api/bounties/:userId
Get all bounties for a specific user.

**Parameters:**
- `userId` (string, required): User identifier

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "taskId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user123",
      "wallet": "9B5X76QSPSLvz4YEKMHzKjK8n3RQcZhdKCdR4YYScah8",
      "status": "paid",
      "reward": 10,
      "rewardToken": "USDC",
      "transactionHash": "5KXhT6YJ8FqK2pL9nM3oQ1rS4tU5vW6xY7zA8bC9dE0FgH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0aB1cD2eE3fG4h",
      "submittedAt": "2024-03-02T10:00:00Z",
      "completedAt": "2024-03-02T10:05:00Z"
    },
    {
      "taskId": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "user123",
      "wallet": "9B5X76QSPSLvz4YEKMHzKjK8n3RQcZhdKCdR4YYScah8",
      "status": "pending",
      "reward": 50,
      "rewardToken": "SOL",
      "submittedAt": "2024-03-02T10:10:00Z"
    }
  ],
  "timestamp": "2024-03-02T10:00:00Z"
}
```

---

## Error Handling

All endpoints follow this error response format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "timestamp": "2024-03-02T10:00:00Z"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting
Currently not implemented. Production deployment should add:
- Per-IP rate limiting
- Per-user bounty request limits
- Transaction cooldown periods

---

## Example Workflows

### Complete Bounty Workflow

```bash
# 1. List all available tasks
curl http://localhost:3000/api/tasks

# Response contains task IDs and details
# Copy a taskId from the response

# 2. Request the bounty
curl -X POST http://localhost:3000/api/bounties/request \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "john_doe",
    "taskId": "550e8400-e29b-41d4-a716-446655440000",
    "wallet": "9B5X76QSPSLvz4YEKMHzKjK8n3RQcZhdKCdR4YYScah8"
  }'

# Response:
# {
#   "success": true,
#   "data": { "status": "pending", ... }
# }

# 3. Complete the task
# (User does the work - tweet, code deployment, etc.)

# 4. Submit completion and get paid
curl -X POST http://localhost:3000/api/bounties/complete \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "john_doe",
    "taskId": "550e8400-e29b-41d4-a716-446655440000",
    "wallet": "9B5X76QSPSLvz4YEKMHzKjK8n3RQcZhdKCdR4YYScah8",
    "proofUrl": "https://twitter.com/john_doe/status/123456789"
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "txHash": "5KXhT6YJ8FqK2pL9nM3oQ1rS4tU5vW6xY7zA8bC9dE0FgH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0aB1cD2eE3fG4h",
#     "bountyId": "john_doe-550e8400-e29b-41d4-a716-446655440000"
#   }
# }

# 5. Check user's bounties
curl http://localhost:3000/api/bounties/john_doe
```

### Filter by Difficulty

```bash
# Get all tasks and filter by difficulty in client
curl http://localhost:3000/api/tasks | jq '.data[] | select(.difficulty=="easy")'
```

### Verify Transaction

```bash
# Use the txHash to verify on Solscan
# https://solscan.io/tx/{txHash}
```

---

## Pagination
Not currently implemented. Future enhancement:

```bash
GET /api/tasks?page=1&limit=10
GET /api/bounties/user123?page=1&limit=20
```

---

## WebSocket Support
Not currently implemented. Future enhancement for real-time bounty updates.

---

## SDK/Client Libraries
Build your own or contribute:
- JavaScript/TypeScript client
- Python client
- Rust client

---

## Support
For issues or questions:
1. Check the main [README.md](README.md)
2. Review error messages carefully
3. Verify wallet addresses with Solscan
4. Check Solana RPC endpoint status
