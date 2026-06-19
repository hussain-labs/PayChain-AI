import express from 'express';
import { protect as authMiddleware } from '../middleware/authMiddleware.js';
import { addWallet, removeWallet, getWallets, getWalletAssets, getWalletHistory } from '../controllers/walletController.js';

const router = express.Router();

router.get('/',                       authMiddleware, getWallets);
router.post('/',                      authMiddleware, addWallet);
router.delete('/:address',            authMiddleware, removeWallet);
router.get('/:address/assets',        authMiddleware, getWalletAssets);
router.get('/:address/history',       authMiddleware, getWalletHistory);

export default router;
