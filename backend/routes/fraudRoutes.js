import express from 'express';
import { analyzeRisk } from '../controllers/fraudController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, analyzeRisk);

export default router;
