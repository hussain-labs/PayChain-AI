import express from 'express';
import { getEscrows, createEscrow, updateEscrowStatus } from '../controllers/escrowController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getEscrows);
router.post('/', createEscrow);
router.put('/:id/status', updateEscrowStatus);

export default router;
