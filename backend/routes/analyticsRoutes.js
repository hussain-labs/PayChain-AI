import express from 'express';
import { getAIAdvisorInsights } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/advisor', protect, getAIAdvisorInsights);

export default router;
