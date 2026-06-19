import express from 'express';
import { createCheckoutSession } from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create checkout session (requires auth)
router.post('/create-checkout-session', protect, createCheckoutSession);

export default router;
