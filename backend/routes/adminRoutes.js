import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminProtect } from '../middleware/adminMiddleware.js';
import {
  getUsers,
  deleteUser,
  toggleUserRole,
  getSupportMessages,
  updateSupportMessageStatus
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', protect, adminProtect, getUsers);
router.delete('/users/:id', protect, adminProtect, deleteUser);
router.put('/users/:id/role', protect, adminProtect, toggleUserRole);

router.get('/support', protect, adminProtect, getSupportMessages);
router.put('/support/:id/status', protect, adminProtect, updateSupportMessageStatus);

export default router;
