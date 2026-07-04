import express from 'express';
import { getTransactions, createTransaction, getTransactionStats } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getTransactionStats);

router.route('/')
  .get(protect, getTransactions)
  .post(protect, createTransaction);

export default router;
