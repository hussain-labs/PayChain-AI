import express from 'express';
import { verifyCheckout } from '../controllers/checkoutController.js';

const router = express.Router();

router.post('/verify', verifyCheckout);

export default router;
