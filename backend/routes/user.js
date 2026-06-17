import express from 'express';
import { getUserAccounts, addUserAccount, getProfile, updateProfile, changePassword, uploadAvatar } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/accounts', protect, getUserAccounts);
router.post('/accounts', protect, addUserAccount);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;
