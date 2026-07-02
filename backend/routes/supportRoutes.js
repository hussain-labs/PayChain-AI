import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createSupportMessage, getSupportMessages } from '../controllers/supportController.js';

const router = express.Router();

router.route('/')
  .post(protect, createSupportMessage)
  .get(protect, getSupportMessages);

export default router;
