import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import checkoutRoutes from './routes/checkout.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/adminRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import fraudRoutes from './routes/fraudRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import escrowRoutes from './routes/escrowRoutes.js';
import { stripeWebhook } from './controllers/subscriptionController.js';
import { connectDb } from './database.js';
import startDailyResetScheduler from './services/dailyResetScheduler.js';

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Mount stripe webhook BEFORE express.json() because Stripe needs the raw body
app.post('/api/subscription/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json({ limit: '10kb' })); // Added size limit for security

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/v1/checkout', checkoutRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/escrows', escrowRoutes);

// Connect to MongoDB and start server
async function startServer() {
  try {
    await connectDb();
    startDailyResetScheduler(); // Reset free users' transaction count at 6 AM daily
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Trigger restart to load new env vars & email.js
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
