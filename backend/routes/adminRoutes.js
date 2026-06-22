import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminProtect } from '../middleware/adminMiddleware.js';
import {
  getUsers,
  deleteUser,
  toggleUserRole,
  toggleUserActive,
  updateUserPlan,
  updateUserLimit,
  updateUser,
  getSystemStats,
  getSupportMessages,
  updateSupportMessageStatus,
  addBonusTransactions,
} from '../controllers/adminController.js';

const router = express.Router();

// User management
router.get('/users', protect, adminProtect, getUsers);
router.put('/users/:id', protect, adminProtect, updateUser);
router.delete('/users/:id', protect, adminProtect, deleteUser);
router.put('/users/:id/role', protect, adminProtect, toggleUserRole);
router.put('/users/:id/active', protect, adminProtect, toggleUserActive);
router.put('/users/:id/plan', protect, adminProtect, updateUserPlan);
router.put('/users/:id/limit', protect, adminProtect, updateUserLimit);
router.put('/users/:id/bonus', protect, adminProtect, addBonusTransactions);

// System stats
router.get('/stats', protect, adminProtect, getSystemStats);

// Support
router.get('/support', protect, adminProtect, getSupportMessages);
router.put('/support/:id/status', protect, adminProtect, updateSupportMessageStatus);

export default router;
