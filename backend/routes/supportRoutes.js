import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createSupportMessage } from '../controllers/supportController.js';

const router = express.Router();

router.post('/', protect, createSupportMessage);

export default router;
