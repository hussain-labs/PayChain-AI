import express from 'express';
import { getEscrows, createEscrow, updateEscrowStatus, deleteEscrow } from '../controllers/escrowController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getEscrows);
router.post('/', createEscrow);
router.put('/:id/status', updateEscrowStatus);
router.delete('/:id', deleteEscrow);

export default router;
