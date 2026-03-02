# Deployment Guide for Eliza Lobster

Production deployment guide for various platforms.

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Local Deployment](#local-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Railway.app](#railwayapp)
5. [Heroku](#heroku)
6. [AWS Lambda](#aws-lambda)
7. [Environment Configuration](#environment-configuration)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, verify:

- ✅ Code builds without errors: `npm run build`
- ✅ All tests pass (if any)
- ✅ `.env` file is NOT committed to git
- ✅ `.gitignore` includes `.env`
- ✅ Solana RPC endpoint is accessible
- ✅ Treasury wallet has sufficient balance
- ✅ Private key is securely stored
- ✅ README is complete and accurate
- ✅ API endpoints tested locally
- ✅ Error handling verified

---

## Local Deployment

### Running on Your Machine

```bash
# Build
npm run build

# Run production server
npm start

# Server will run on http://localhost:3000
```

### With PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start dist/index.js --name "eliza-lobster"

# View logs
pm2 logs eliza-lobster

# Monitor
pm2 monit eliza-lobster

# Stop
pm2 stop eliza-lobster

# Restart
pm2 restart eliza-lobster
```

### With Systemd (Linux)

Create `/etc/systemd/system/eliza-lobster.service`:

```ini
[Unit]
Description=Eliza Lobster Bounty Service
After=network.target

[Service]
Type=simple
User=nobody
WorkingDirectory=/opt/eliza-lobster
Environment="PATH=/usr/local/bin:/usr/bin"
Environment="NODE_ENV=production"
EnvironmentFile=/opt/eliza-lobster/.env
ExecStart=/usr/bin/node /opt/eliza-lobster/dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable eliza-lobster
sudo systemctl start eliza-lobster
sudo systemctl status eliza-lobster
```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /build/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  eliza-lobster:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      SOLANA_RPC: ${SOLANA_RPC}
      TREASURY_PRIVATE_KEY: ${TREASURY_PRIVATE_KEY}
      PORT: 3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Build and Run

```bash
# Build image
docker build -t eliza-lobster:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e SOLANA_RPC="https://api.mainnet-beta.solana.com" \
  -e TREASURY_PRIVATE_KEY="your-key-here" \
  --name eliza-lobster \
  eliza-lobster:latest

# Check logs
docker logs -f eliza-lobster

# Stop container
docker stop eliza-lobster
```

### With Docker Compose

```bash
# Create .env file
cp .env.example .env
# Edit .env with your values

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Railway.app

### Easiest Cloud Deployment ✨

1. **Create Account**: https://railway.app
2. **Connect GitHub**:
   - Link your repository
   - Grant permissions

3. **Deploy**:
   - Push code to GitHub
   - Railway auto-detects Node.js
   - Automatic builds and deploys

4. **Configure Environment**:
   ```bash
   # In Railway Dashboard:
   # Add variables:
   SOLANA_RPC=https://api.mainnet-beta.solana.com
   TREASURY_PRIVATE_KEY=your-key-here
   NODE_ENV=production
   ```

5. **Access**:
   - Railway gives you a public URL
   - Auto HTTPS certificate
   - View logs in dashboard

### Benefits
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Built-in database options
- ✅ Easy environment management
- ✅ Monitoring dashboard

---

## Heroku

### Deploy to Heroku

#### Using Heroku CLI

```bash
# Install Heroku CLI
# From https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create app
heroku create eliza-lobster

# Set environment variables
heroku config:set SOLANA_RPC="https://api.mainnet-beta.solana.com"
heroku config:set TREASURY_PRIVATE_KEY="your-key-here"
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs -t

# Open app
heroku open

# Check status
heroku ps
```

#### Using Heroku Dashboard

1. Create new app
2. Connect to GitHub repository
3. Enable automatic deploys
4. Set Config Vars (environment variables)
5. Deploy manually or via git push

#### Procfile

Create `Procfile`:

```
web: node dist/index.js
```

---

## AWS Lambda

### Serverless Deployment

#### 1. Install Serverless Framework

```bash
npm install -g serverless
```

#### 2. Configure AWS Credentials

```bash
# Download AWS credentials from IAM
# Then configure:
aws configure
```

#### 3. Create serverless.yml

```yaml
service: eliza-lobster

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    SOLANA_RPC: ${env:SOLANA_RPC}
    TREASURY_PRIVATE_KEY: ${env:TREASURY_PRIVATE_KEY}
    NODE_ENV: production

functions:
  api:
    handler: dist/index.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true

plugins:
  - serverless-offline
  - serverless-plugin-tracing
```

#### 4. Deploy

```bash
# Set environment variables
export SOLANA_RPC="https://api.mainnet-beta.solana.com"
export TREASURY_PRIVATE_KEY="your-key-here"

# Deploy to AWS
serverless deploy

# View logs
serverless logs -f api

# Remove (cleanup)
serverless remove
```

### Cost Considerations
- AWS Lambda free tier: 1M requests/month
- Each request costs ~$0.0000002
- Ideal for low-traffic applications

---

## Environment Configuration

### Production Environment Variables

```env
# Must-have variables
SOLANA_RPC=https://api.mainnet-beta.solana.com
TREASURY_PRIVATE_KEY=YourBase58EncodedKey
NODE_ENV=production
PORT=3000

# Optional monitoring
SENTRY_DSN=https://your-sentry-url
LOG_LEVEL=info
```

### Network Configuration

**For Mainnet (Production):**
```env
SOLANA_RPC=https://api.mainnet-beta.solana.com
```

**For Devnet (Testing):**
```env
SOLANA_RPC=https://api.devnet.solana.com
```

**Custom RPC Providers:**
- Helius: `https://mainnet.helius-rpc.com/`
- QuickNode: `https://solana-mainnet.quiknode.pro/`
- Triton: `https://mainnet.rpc.triton.one/`

### Key Security

**DO NOT**:
- Store private keys in version control
- Log private keys
- Share keys via email
- Use same key for dev and prod

**DO**:
- Use environment variables
- Rotate keys periodically
- Use key management services
- Store securely in deployment platform

---

## Monitoring

### Health Check Endpoint

```bash
curl https://your-app.com/health

# Response:
{
  "status": "healthy",
  "service": "eliza-lobster",
  "timestamp": "2024-03-02T10:00:00Z"
}
```

### Logging Setup

#### Using Winston (Add to package.json)

```bash
npm install winston
```

Then use in `src/index.ts`:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Error Tracking with Sentry

```bash
npm install @sentry/node
```

In your code:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({ dsn: process.env.SENTRY_DSN });

// Capture errors
app.use(Sentry.Handlers.errorHandler());
```

### Metrics to Monitor

- **Request Rate**: Requests per minute
- **Error Rate**: Failed requests percentage
- **Response Time**: Average latency
- **Bounty Completion Rate**: Tasks completed
- **Payout Success Rate**: Successful transactions
- **Treasury Balance**: Available funds
- **Transaction Costs**: Fee tracking

---

## Troubleshooting

### Issue: "Connection Refused"

```bash
# Check if service is running
curl http://localhost:3000/health

# View logs
npm run dev 2>&1 | grep error

# Verify port is available
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### Issue: "Out of Memory"

```bash
# Check Node.js memory usage
node --max-old-space-size=4096 dist/index.js

# Or in environment:
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Issue: "RPC Endpoint Timeout"

```bash
# Try different RPC endpoint
SOLANA_RPC=https://mainnet.helius-rpc.com/ npm start

# Check endpoint status
curl https://api.mainnet-beta.solana.com/
```

### Issue: "Transaction Failure"

Check:
1. Treasury wallet has balance: `solana balance`
2. Wallet address is valid
3. Network is not congested
4. RPC endpoint is responding

```bash
# Monitor transaction
solana confirm -v <transaction-hash>
```

### Issue: "Build Fails"

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

---

## Performance Optimization

### Tips for Production

1. **Enable Caching**:
   ```typescript
   app.use((req, res, next) => {
     res.set('Cache-Control', 'public, max-age=60');
     next();
   });
   ```

2. **Compression**:
   ```bash
   npm install compression
   app.use(compression());
   ```

3. **Rate Limiting**:
   ```bash
   npm install express-rate-limit
   ```

4. **Database Optimization**:
   - Use connection pooling
   - Index frequently queried fields
   - Regular backups

5. **Load Balancing**:
   - Use multiple instances
   - Put behind Nginx/HAProxy
   - Use Cloudflare for CDN

---

## Rollback & Recovery

### Rollback on Deployment Issue

```bash
# Docker
docker run -d \
  --name eliza-lobster-backup \
  eliza-lobster:previous-tag

# Heroku
heroku releases
heroku rollback v42

# Railway
Click "Redeploy" on previous deployment

# AWS Lambda
serverless deploy function -f api --image previous-version
```

### Database Backup

```bash
# Before deploying, backup data
# If using MongoDB
mongodump --db eliza_lobster

# If using PostgreSQL
pg_dump eliza_db > backup.sql
```

---

## Security Checklist for Production

- ✅ Private key in environment variables
- ✅ HTTPS enforced
- ✅ Input validation enabled
- ✅ Rate limiting configured
- ✅ Error logging without secrets
- ✅ CORS properly configured
- ✅ Firewall rules set up
- ✅ Regular security audits
- ✅ Backup and recovery plan
- ✅ Monitoring and alerts enabled

---

## Support & Resources

- **Solana RPC Providers**: https://solana.com/rpc
- **Railway Docs**: https://docs.railway.app
- **Heroku Docs**: https://devcenter.heroku.com
- **AWS Lambda**: https://aws.amazon.com/lambda
- **Docker**: https://docs.docker.com

---

## Next Steps After Deployment

1. Monitor application health
2. Set up alerts for errors
3. Collect usage metrics
4. Plan scaling strategy
5. Gather user feedback
6. Plan feature releases
7. Security audits
8. Performance optimization

---

**Status: Ready for Production** 🚀

Choose your deployment platform and get Eliza Lobster running in the cloud!
