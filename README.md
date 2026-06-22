# 💳 PayChain AI — Blockchain-Powered Payment Platform

<div align="center">

![PayChain AI](https://img.shields.io/badge/PayChain-AI%20Powered-blueviolet?style=for-the-badge&logo=ethereum)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?style=for-the-badge&logo=mongodb)
![Ethereum](https://img.shields.io/badge/Ethereum-Blockchain-3c3c3d?style=for-the-badge&logo=ethereum)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635bff?style=for-the-badge&logo=stripe)

**A next-generation, AI-secured blockchain payment platform combining real-time crypto transactions, intelligent fraud detection, and a seamless multi-wallet management experience.**

</div>

---

## 📖 Table of Contents

- [Introduction](#-introduction)
- [Core Features](#-core-features)
- [Architecture & Methods](#️-architecture--methods)
- [Use Cases](#-use-cases)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Setup & Installation](#-setup--installation)
- [API Endpoints](#-api-endpoints)
- [Subscription Plans](#-subscription-plans)
- [Admin Panel](#-admin-panel)
- [Contributing](#-contributing)

---

## 🌟 Introduction

**PayChain AI** is a Final Year Project (FYP) that merges **blockchain technology**, **artificial intelligence**, and **modern web development** to create a production-grade decentralized payment platform. Users can connect Ethereum wallets, send crypto transactions across the Sepolia testnet, view real-time token balances, and receive AI-powered **risk analysis** on every transaction before it is submitted.

The platform supports **three subscription tiers** (Free, Business Pro, Enterprise) managed via Stripe, with a complete **Admin Dashboard** for platform oversight. An integrated **AI Chatbot** powered by Google Gemini assists users with payment guidance, blockchain queries, and security advice.

> **Final Year Project** — Built with production-level code quality, security practices, and a rich feature set suitable for real-world deployment.

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure register/login with bcrypt password hashing and JWT tokens |
| 👛 **Multi-Wallet Management** | Save, manage, and monitor multiple Ethereum wallet addresses |
| 📊 **Real-time Wallet Balances** | Live ETH and ERC-20 token balances via Alchemy + CoinGecko pricing |
| 🔗 **On-chain Transaction History** | Fetch and display real blockchain transaction history (Sepolia testnet) |
| 🤖 **AI Risk Analysis** | Every outgoing transaction is analysed by Gemini AI (with Groq fallback) for fraud risk before submission |
| 🔄 **Automatic API Key Rotation** | Up to 14+ Gemini API keys rotated automatically on rate-limit; active index persisted in MongoDB |
| 💬 **AI Chatbot** | Integrated chatbot powered by Google Gemini for payment assistance and blockchain education |
| 💳 **Stripe Subscriptions** | Real Stripe Checkout integration for monthly plan upgrades with webhook-based plan activation |
| 📈 **Statistics Dashboard** | Visual analytics for transaction history, balances, and platform usage |
| 🔔 **Notifications System** | Real-time in-app notifications for key events (plan upgrades, admin alerts) |
| 🌐 **Currency Converter** | Live crypto-to-fiat conversion tool |
| 👑 **Admin Panel** | Full admin dashboard for user management, plan overrides, support, and platform statistics |
| ☀️ **Dark/Light Theme** | Complete theme switching across the entire application |
| 📱 **QR Code Scanner** | Scan wallet addresses via QR code for faster transfers |
| ⏱️ **Daily Reset Scheduler** | Automatic daily reset of free-tier transaction limits at 6 AM (node-cron) |
| 📁 **Avatar Uploads** | Profile image upload via Cloudinary CDN |

---

## 🏗️ Architecture & Methods

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (React 19 + Vite)         │
│  Pages: Dashboard, Transfers, Wallet, Settings, Admin   │
│  State: React Context + TanStack Query                  │
│  Wallet Connect: wagmi + viem (Ethereum)                │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API (axios)
┌───────────────────────▼─────────────────────────────────┐
│                  BACKEND (Express.js + Node.js)          │
│  Auth → JWT + bcrypt                                    │
│  Routes: /api/auth, /api/wallets, /api/transactions,    │
│          /api/chat, /api/subscription, /api/admin       │
└──────┬──────────────────────────────────┬───────────────┘
       │                                  │
┌──────▼──────┐                 ┌─────────▼──────────────┐
│  MongoDB    │                 │  External Services      │
│  (Mongoose) │                 │  • Alchemy RPC (ETH)    │
│  Users      │                 │  • Google Gemini AI     │
│  Txns       │                 │  • Groq (Llama fallback)│
│  Support    │                 │  • Stripe (Payments)    │
│  ApiKeys    │                 │  • Cloudinary (Images)  │
└─────────────┘                 │  • CoinGecko (Prices)   │
                                └─────────────────────────┘
```

### Methods & Core Systems

#### 1. 🤖 AI Intelligence Engine (`backend/services/intelligenceEngine.js`)
The custom AI engine powers transaction risk analysis with a multi-provider failover strategy:
- **Primary:** Google Gemini 2.0 Flash (up to 14 API keys, auto-rotated)
- **Fallback:** Groq (Llama 3.3 70B) — activates only when ALL Gemini keys are exhausted
- **Risk Scoring:** Returns a structured JSON with `riskScore` (0-100), `riskLevel`, `riskFactors`, `verdict`, `recommendation`, and `merchantAction` (`APPROVE` / `WARN_USER` / `REJECT`)

#### 2. 🔑 API Key Rotation (`backend/services/keyRotationService.js`)
- Reads up to N Gemini keys (`GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, ...) from `.env`
- Saves the active key index to MongoDB so it **persists across server restarts**
- Automatically wraps around back to key #1 after the last key

#### 3. 👛 Wallet System (`backend/controllers/walletController.js`)
- **Add / Remove** saved wallets per user
- **ETH Balance:** Fetched live from Sepolia via a public RPC
- **ERC-20 Tokens:** Fetched via Alchemy `alchemy_getTokenBalances`
- **USD Pricing:** CoinGecko API for per-token USD values
- **Transaction History:** `alchemy_getAssetTransfers` (sent + received, merged & sorted)
- **Plan-gated limits:** Free → 1 wallet, Pro → 10 wallets, Enterprise → unlimited

#### 4. 💳 Subscription & Billing (`backend/controllers/subscriptionController.js`)
- Stripe Checkout sessions created server-side for secure PCI-compliant payments
- **Webhook handler** (`/api/subscription/webhook`) listens for:
  - `checkout.session.completed` → upgrades user plan in MongoDB
  - `invoice.payment_succeeded` → resets monthly transaction count on renewal
- Raw body parsing applied to webhook route only (required by Stripe)

#### 5. ⏱️ Daily Reset Scheduler (`backend/services/dailyResetScheduler.js`)
- Uses `node-cron` to reset Free-tier users' `transactionCount` to `0` every day at **6:00 AM**
- Prevents free users from exceeding their daily transaction quota

#### 6. 🔐 Authentication (`backend/controllers/authController.js`)
- `POST /api/auth/register` — Hashes password with bcrypt, creates user, returns JWT
- `POST /api/auth/login` — Validates credentials, returns signed JWT
- All protected routes use `authMiddleware.js` to verify the JWT and attach `req.userId`

---

## 🎯 Use Cases

### 👤 Individual Users
- **Crypto Portfolio Tracking** — Connect multiple Ethereum wallets and monitor real-time ETH + ERC-20 balances with USD equivalents in a single dashboard.
- **Safe Transfers** — Before sending any crypto, receive an AI-generated risk score to catch phishing addresses, drainer contracts, or suspicious patterns.
- **Transaction History** — View a complete on-chain history of sent and received transactions with timestamps and status.
- **QR-based Payments** — Scan a recipient's wallet QR code to auto-fill the transfer form.

### 🏢 Business Users (Pro / Enterprise)
- **Multi-wallet Management** — Manage up to 10 (Pro) or unlimited (Enterprise) wallet addresses from a single account.
- **High-volume Transactions** — Up to 1,000 transactions/month (Pro) or unlimited (Enterprise) with automated monthly limit resets.
- **AI Fraud Prevention** — Every outgoing transaction is screened by the AI engine, protecting business funds from common attack vectors.
- **Custom Enterprise Pricing** — Pay dynamically based on the number of extra wallets needed ($99 base + $5/wallet).

### 👑 Platform Administrators
- **User Management** — View all users, search/filter by name or email, promote to admin, deactivate accounts.
- **Plan Overrides** — Manually upgrade or downgrade any user's subscription plan.
- **Support Inbox** — Read and respond to all user-submitted support tickets.
- **Platform Statistics** — Monitor total users, active subscriptions, transaction volumes, and other KPIs.

### 🎓 Academic / FYP Context
- **Blockchain Integration Demo** — Full end-to-end proof of concept for integrating Web3 (Ethereum/Sepolia) with a traditional web backend.
- **AI in Finance** — Demonstrates practical application of LLMs (Gemini, Groq) in financial risk assessment.
- **Full-stack Architecture** — Showcases React 19, Express.js, MongoDB, and Stripe in a real-world payment application.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| React Router DOM | 7 | Client-side routing |
| wagmi + viem | latest | Ethereum wallet connection |
| TanStack Query | 5 | Server state management |
| react-hot-toast | 2 | Toast notifications |
| jsQR | 1.4 | QR code scanning |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Express.js | 5 | Web framework |
| Mongoose | 9 | MongoDB ODM |
| bcrypt | 6 | Password hashing |
| jsonwebtoken | 9 | JWT auth |
| Stripe SDK | 22 | Payment processing |
| @google/genai | 2 | Gemini AI |
| ethers.js | 6 | Ethereum interaction |
| Cloudinary | 1 | Image uploads |
| multer | 2 | File uploads |
| node-cron | 4 | Task scheduling |
| morgan | 1 | HTTP request logging |
| helmet | 8 | Security headers |
| cors | 2 | Cross-origin requests |
| dotenv | 17 | Environment variables |

### Smart Contracts
| Technology | Purpose |
|---|---|
| Hardhat | Ethereum development environment |

### External APIs
| Service | Purpose |
|---|---|
| Alchemy | Ethereum RPC (token balances, history) |
| CoinGecko | Live crypto/USD price feeds |
| Google Gemini | AI risk analysis (primary) |
| Groq (Llama 3.3) | AI risk analysis (fallback) |
| Stripe | Payment processing & subscriptions |
| Cloudinary | Avatar/image CDN |

---

## 📁 Project Structure

```
PayChain-AI/
├── backend/                        # Node.js + Express backend
│   ├── controllers/
│   │   ├── adminController.js      # Admin user management, stats
│   │   ├── authController.js       # Register / login
│   │   ├── chatController.js       # AI chatbot endpoint
│   │   ├── checkoutController.js   # Checkout helpers
│   │   ├── subscriptionController.js # Stripe checkout + webhook
│   │   ├── supportController.js    # Support ticket management
│   │   ├── transactionController.js # Transaction CRUD
│   │   ├── userController.js       # Profile, avatar, settings
│   │   └── walletController.js     # Wallet CRUD + on-chain data
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification
│   │   └── adminMiddleware.js      # Admin role check
│   ├── models/
│   │   ├── User.js                 # User schema (plan, wallets, notifications)
│   │   ├── Transaction.js          # On-chain transaction record
│   │   ├── SupportMessage.js       # Support ticket schema
│   │   └── ApiKeyState.js          # Gemini key rotation state
│   ├── routes/
│   │   ├── auth.js                 # /api/auth
│   │   ├── user.js                 # /api/user
│   │   ├── walletRoutes.js         # /api/wallets
│   │   ├── transactionRoutes.js    # /api/transactions
│   │   ├── subscriptionRoutes.js   # /api/subscription
│   │   ├── adminRoutes.js          # /api/admin
│   │   ├── supportRoutes.js        # /api/support
│   │   ├── chat.js                 # /api/chat
│   │   └── checkout.js             # /api/v1/checkout
│   ├── services/
│   │   ├── intelligenceEngine.js   # Gemini + Groq AI engine
│   │   ├── keyRotationService.js   # API key rotation logic
│   │   └── dailyResetScheduler.js  # Cron job for daily limit resets
│   ├── utils/
│   ├── database.js                 # MongoDB connection
│   ├── server.js                   # Express app entry point
│   ├── seedAdmin.js                # Script to seed an admin user
│   └── .env                        # Environment variables (see below)
│
├── frontend/                       # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation bar
│   │   │   ├── AppSidebar.jsx      # Dashboard sidebar
│   │   │   ├── Chatbot.jsx         # AI chatbot widget
│   │   │   ├── Pricing.jsx         # Pricing cards
│   │   │   ├── QRScannerModal.jsx  # QR code scanner
│   │   │   ├── TopUpModal.jsx      # Wallet top-up modal
│   │   │   ├── UserProfilePopup.jsx # Profile popup
│   │   │   ├── NotificationBell.jsx # Notification dropdown
│   │   │   └── ...                 # Other components
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main dashboard overview
│   │   │   ├── Transfers.jsx       # Send crypto with AI risk
│   │   │   ├── WalletOverview.jsx  # Wallet management
│   │   │   ├── Statistics.jsx      # Analytics & charts
│   │   │   ├── Settings.jsx        # Account settings
│   │   │   ├── Notifications.jsx   # Notification center
│   │   │   ├── Chatbot.jsx         # Full chatbot page
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   ├── CurrencyConverter.jsx # Crypto converter
│   │   │   ├── Support.jsx         # Support ticket form
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx    # Admin overview
│   │   │       ├── AdminUsers.jsx        # All users list
│   │   │       ├── AdminUserProfile.jsx  # Individual user management
│   │   │       ├── AdminSupport.jsx      # Support inbox
│   │   │       └── AdminSettings.jsx     # Admin settings
│   │   ├── context/                # React Context providers
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── config/                 # Axios & app config
│   │   ├── App.jsx                 # Root app + routing
│   │   └── main.jsx                # React entry point
│   └── index.html
│
├── smart_contracts/                # Hardhat Ethereum smart contracts
│   └── package.json
│
└── README.md                       # This file
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

Create a file at `backend/.env` with the following variables:

```env
# ── Server ──────────────────────────────────────────────
PORT=5000

# ── Database ────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/Paychain

# ── Auth ────────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# ── AI — Gemini (add as many keys as you want) ─────────
# The system auto-rotates: key_1 → key_2 → ... → wraps back
GEMINI_API_KEY_1=AIzaSy...your_first_key
GEMINI_API_KEY_2=AIzaSy...your_second_key
GEMINI_API_KEY_3=AIzaSy...your_third_key

# ── AI — Groq (fallback when all Gemini keys fail) ─────
GROK_API_KEY=gsk_...your_groq_key

# ── Blockchain ──────────────────────────────────────────
# Full Alchemy URL for Sepolia testnet
ALCHEMY_API_KEY=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_key

# ── Cloudinary (for avatar uploads) ───────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ── Stripe (payments) ───────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_...your_webhook_signing_secret

# ── Frontend URL (for Stripe redirect) ─────────────────
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

Create a file at `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

> **⚠️ Security Warning:** Never commit your real `.env` files to version control. Add them to `.gitignore`. The `.env` files shown above should only contain placeholder values in the repository.

---

## 🚀 Setup & Installation

### Prerequisites

Make sure you have the following installed on your machine:

| Tool | Version | Download |
|---|---|---|
| Node.js | v18+ (LTS recommended) | [nodejs.org](https://nodejs.org) |
| npm | v9+ | Comes with Node.js |
| MongoDB Atlas | Account | [cloud.mongodb.com](https://cloud.mongodb.com) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/PayChain-AI.git
cd PayChain-AI
```

### Step 2 — Set Up the Backend

```bash
# Navigate to the backend directory
cd backend

# Install all dependencies
npm install

# Create your environment file
cp .env.example .env     # or manually create backend/.env
# Fill in all variables as described in the Environment Variables section above
```

### Step 3 — Set Up the Frontend

```bash
# From the project root, navigate to frontend
cd ../frontend

# Install all dependencies
npm install

# Create your frontend environment file
echo "VITE_API_URL=http://localhost:5000" > .env
```

### Step 4 — Seed an Admin User (Optional but Recommended)

```bash
# From the backend directory
cd backend
node seedAdmin.js
```

This creates a default admin account. Check `seedAdmin.js` for the default credentials and change them immediately after first login.

### Step 5 — Run the Development Servers

Open **two separate terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App starts on http://localhost:5173
```

### Step 6 — Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

---

## 🌐 API Endpoints

### Authentication
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | ❌ |
| POST | `/api/auth/login` | Login and receive JWT | ❌ |

### User
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/user/profile` | Get current user profile | ✅ |
| PUT | `/api/user/profile` | Update profile info | ✅ |
| POST | `/api/user/avatar` | Upload avatar image | ✅ |

### Wallets
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/wallets` | List saved wallets | ✅ |
| POST | `/api/wallets` | Add a new wallet | ✅ |
| DELETE | `/api/wallets/:address` | Remove a wallet | ✅ |
| GET | `/api/wallets/:address/assets` | Get on-chain ETH + token balances | ✅ |
| GET | `/api/wallets/:address/history` | Get on-chain transaction history | ✅ |

### Transactions
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/transactions` | List user's transactions | ✅ |
| POST | `/api/transactions` | Record a transaction | ✅ |

### AI Chat
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/chat` | Send message to AI chatbot | ✅ |

### Subscriptions
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/subscription/checkout` | Create Stripe checkout session | ✅ |
| POST | `/api/subscription/webhook` | Stripe webhook handler | ❌ (Stripe signature) |
| GET | `/api/subscription/status` | Get current subscription status | ✅ |

### Admin
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/admin/users` | List all users | ✅ Admin |
| GET | `/api/admin/users/:id` | Get user detail | ✅ Admin |
| PUT | `/api/admin/users/:id/plan` | Change user plan | ✅ Admin |
| DELETE | `/api/admin/users/:id` | Delete user | ✅ Admin |
| GET | `/api/admin/stats` | Platform statistics | ✅ Admin |

### Support
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/support` | Submit a support ticket | ✅ |
| GET | `/api/support` | List all tickets (admin) | ✅ Admin |

---

## 💰 Subscription Plans

| Feature | Free | Business Pro ($29/mo) | Enterprise ($99+/mo) |
|---|:---:|:---:|:---:|
| Saved Wallets | 1 | 10 | Unlimited |
| Transactions / Month | Limited (daily reset) | 1,000 | Unlimited |
| AI Risk Analysis | ✅ | ✅ | ✅ |
| AI Chatbot | ✅ | ✅ | ✅ |
| Real-time Balances | ✅ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |
| Custom Extra Wallets | ❌ | ❌ | ✅ ($5/wallet) |

Subscriptions are billed monthly through **Stripe**. Limits reset automatically at the start of each billing cycle via Stripe's `invoice.payment_succeeded` webhook.

---

## 👑 Admin Panel

The admin panel is accessible at `/admin/dashboard` for users with `isAdmin: true`.

**Admin capabilities include:**
- 📋 **User List** — Search, filter, and paginate all registered users
- 🔍 **User Profiles** — View full profile, transaction history, subscription status
- ⚙️ **Plan Management** — Override any user's plan directly
- 🔒 **Account Control** — Activate/deactivate user accounts
- 📧 **Support Inbox** — Read and manage all support tickets
- 📊 **Statistics** — Platform-wide analytics and KPIs
- 🛡️ **Admin Settings** — Manage admin-level configuration

To grant admin access, either:
1. Run `node seedAdmin.js` to create the first admin user
2. Manually set `isAdmin: true` on a user document in MongoDB

---

## 🔒 Security Features

- **Password Hashing** — bcrypt with salt rounds
- **JWT Authentication** — Signed tokens with expiry
- **Request Size Limiting** — `10kb` body limit on all JSON routes
- **Stripe Webhook Verification** — Signature validation via `stripe.webhooks.constructEvent`
- **Plan-based Access Control** — Feature gating enforced on the server side
- **Admin Middleware** — Separate `adminMiddleware.js` protects all `/api/admin` routes
- **Environment Variables** — All secrets stored in `.env`, never hardcoded

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is built as a **Final Year Project** for academic purposes. All rights reserved to the project authors.

---

<div align="center">

**Built with ❤️ using React, Node.js, MongoDB, Ethereum & Google Gemini AI**

</div>
