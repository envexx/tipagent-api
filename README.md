# TipAgent API

**Autonomous USDT Tipping Bot for Open Source Contributors**

TipAgent is an AI-powered tipping agent that automatically rewards open source contributors with USDT tips based on their contributions. Built with Tether WDK SDK for secure, non-custodial HD wallet management.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![WDK](https://img.shields.io/badge/Tether-WDK-00A86B.svg)](https://docs.tether.to/wdk)

## Live Demo

- **Dashboard**: https://tipagent.pages.dev
- **API**: https://tipagent-api.vercel.app
- **Demo Video**: [YouTube Link - Coming Soon]

## Features

- **AI-Powered Evaluation**: Google Gemini 2.0 Flash evaluates PR/issue contributions and determines tip amounts
- **HD Wallet per Project**: Each project gets isolated funds via WDK HD derivation
- **Aave Yield Optimization**: Idle treasury funds earn yield via Aave V3 lending
- **GitHub Integration**: Auto-webhook setup, PR/issue monitoring, comment notifications
- **Owner-Defined Rules**: Configurable min/max tips, daily caps, cooldowns, and task priorities
- **Multi-Chain Ready**: Base Network (primary), Polygon support

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  GitHub Webhook │────▶│   Vercel API     │────▶│  Cloudflare D1  │
│  (PR/Issue)     │     │   (Hono + WDK)   │     │  (Database)     │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ Gemini   │ │ WDK HD   │ │ Aave V3  │
              │ AI Agent │ │ Wallet   │ │ Lending  │
              └──────────┘ └──────────┘ └──────────┘
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Vercel Serverless (Node.js) |
| Framework | Hono.js |
| Database | Cloudflare D1 (SQLite) |
| Queue | Cloudflare Queues |
| Wallet | **@tetherto/wdk** + **@tetherto/wdk-wallet-evm** |
| Lending | **@tetherto/wdk-protocol-lending-aave-evm** |
| AI | Google Gemini 2.0 Flash |
| Auth | GitHub OAuth |
| Frontend | React + Vite (Cloudflare Pages) |

## Third-Party Services Disclosure

| Service | Purpose | Required |
|---------|---------|----------|
| **Tether WDK** | HD wallet derivation, USDT transfers | Yes |
| **Google Gemini API** | AI evaluation of contributions | Yes |
| **GitHub OAuth** | User authentication | Yes |
| **Cloudflare D1** | Database storage | Yes |
| **Cloudflare Queues** | Async tip processing | Yes |
| **Aave V3** | Yield optimization for idle funds | Optional |
| **Base Network** | Primary blockchain (L2) | Yes |

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Cloudflare account (for D1 database)
- Vercel account (for API deployment)
- GitHub OAuth App
- Google Gemini API key

### 1. Clone & Install

```bash
git clone https://github.com/envexx/tipagent-api.git
cd tipagent-api
pnpm install
```

### 2. Environment Variables

Create `.dev.vars` in `apps/api/`:

```env
# AI & Blockchain
GEMINI_API_KEY=your_gemini_api_key
WDK_MASTER_SEED=0x_your_64_char_hex_seed
BASE_RPC_URL=https://mainnet.base.org
POLYGON_RPC_URL=https://polygon-rpc.com

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_TOKEN=your_github_pat_token

# Discord (optional)
DISCORD_BOT_TOKEN=optional
DISCORD_WEBHOOK_SECRET=random_32chars

# URLs
API_URL=http://localhost:8787
FRONTEND_URL=http://localhost:5173

# Runtime Config
ENVIRONMENT=development
PRIMARY_CHAIN=base
LIQUID_RESERVE_USDT=50
YIELD_ENABLED=true
```

### 3. Setup Database

```bash
cd apps/api

# Create D1 database
wrangler d1 create tipagent-db

# Apply schema
wrangler d1 execute tipagent-db --local --file=src/db/schema.sql
```

### 4. Run Locally

```bash
# API (port 8787)
cd apps/api && pnpm dev

# Dashboard (port 5173)
cd apps/dashboard && pnpm dev
```

### 5. Deploy to Production

**API (Vercel):**
```bash
cd apps/api
vercel deploy --prod
```

Set environment variables in Vercel dashboard.

**Dashboard (Cloudflare Pages):**
```bash
cd apps/dashboard
pnpm build
wrangler pages deploy dist --project-name=tipagent
```

## WDK Integration

TipAgent uses official Tether WDK SDK for all wallet operations:

### HD Wallet Manager

```typescript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'

const wdk = new WDK(masterSeed)
  .registerWallet('base', WalletManagerEvm, {
    provider: rpcUrl,
  })

// Get wallet address for project
const account = await wdk.getAccount('base', projectId)
const address = account.getAddress()

// Get USDT balance
const balance = await account.getTokenBalance(USDT_ADDRESS)

// Transfer USDT
const result = await account.sendTransaction({
  to: recipientAddress,
  value: BigInt(amount * 1e6),
  tokenAddress: USDT_ADDRESS,
})
```

### Aave Lending Integration

```typescript
import AaveLendingProtocol from '@tetherto/wdk-protocol-lending-aave-evm'

const wdk = new WDK(masterSeed)
  .registerWallet('base', WalletManagerEvm, { provider })
  .registerProtocol('base', 'lending-aave', AaveLendingProtocol, { provider })

// Deposit idle funds
await account.executeProtocol('lending-aave', {
  action: 'supply',
  tokenAddress: USDT_ADDRESS,
  amount: BigInt(excess * 1e6),
})

// Withdraw for tip
await account.executeProtocol('lending-aave', {
  action: 'withdraw',
  tokenAddress: USDT_ADDRESS,
  amount: BigInt(needed * 1e6),
})
```

## API Endpoints

### Authentication
- `GET /auth/github` - Initiate GitHub OAuth
- `GET /auth/github/callback` - OAuth callback
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Projects
- `GET /api/projects` - List user's projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project (auto-registers webhook)
- `PUT /api/projects/:id` - Update tip rules & tasks

### Webhooks
- `POST /webhooks/github` - GitHub webhook receiver
- `POST /webhooks/discord` - Discord webhook receiver

### Health
- `GET /health` - API health check with wallet status

## How It Works

1. **Project Owner** creates a project, linking their GitHub repo
2. **Webhook** is auto-registered on GitHub
3. **Contributors** submit PRs or close issues
4. **AI Agent** (Gemini) evaluates the contribution based on:
   - Code changes (additions/deletions)
   - PR title and description
   - Owner-defined task priorities
5. **Tip Decision** is made with amount between min/max rules
6. **USDT Transfer** is executed from project's HD wallet
7. **Notification** is posted as GitHub comment

## Project Structure

```
tipagent-api/
├── apps/
│   ├── api/                 # Backend API (Vercel)
│   │   ├── src/
│   │   │   ├── agent/       # AI evaluation (Gemini)
│   │   │   ├── db/          # D1 queries & schema
│   │   │   ├── engine/      # Rule engine
│   │   │   ├── jobs/        # Cron jobs (yield optimizer)
│   │   │   ├── lib/         # GitHub API helpers
│   │   │   ├── middleware/  # Session auth
│   │   │   ├── notifier/    # GitHub/Discord notifications
│   │   │   ├── queue/       # Queue processor
│   │   │   ├── routes/      # API routes
│   │   │   ├── triggers/    # Webhook normalizers
│   │   │   └── wallet/      # WDK HD wallet & yield
│   │   └── wrangler.toml
│   └── dashboard/           # Frontend (Cloudflare Pages)
│       └── src/
│           ├── components/
│           ├── pages/
│           └── lib/
└── packages/
    └── shared/              # Shared types & constants
```

## Security

- **Non-Custodial**: Each project has its own HD-derived wallet
- **HMAC Verification**: All webhooks are signature-verified
- **Session Auth**: Secure cookie-based sessions with CSRF protection
- **No Hardcoded Keys**: All secrets via environment variables

## License

Apache License 2.0 - See [LICENSE](LICENSE)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## Acknowledgments

- [Tether WDK](https://docs.tether.to/wdk) - Wallet Development Kit
- [Google Gemini](https://ai.google.dev/) - AI evaluation
- [Aave V3](https://aave.com/) - DeFi lending protocol
- [Base Network](https://base.org/) - L2 blockchain
- [Cloudflare](https://cloudflare.com/) - Edge infrastructure
- [Hono](https://hono.dev/) - Web framework

---

**Built for Tether WDK Hackathon 2026**
