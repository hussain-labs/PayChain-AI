import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGODB_URI);

import { analyzeTransactionRisk } from './services/intelligenceEngine.js';

const result = await analyzeTransactionRisk({
  buyerWallet: '0xF39E2c522c53C4e0bD67CE84d95868CdFcb91B86',
  walletAgeDays: 365,
  targetContract: '0x6eBd241a46A31D03dFFC34DB97A8165F7Ce6aeCb',
  functionSignature: '0x',
  valueRequested: '0.001',
  asset: 'ETH',
  contextualHints: { isSelfTransfer: true, isRecipientKnownPlatformUser: true, senderVerified: true },
  contextNote: 'Internal self-transfer between own wallets.'
});
console.log(JSON.stringify(result, null, 2));

await mongoose.disconnect();
process.exit(0);
