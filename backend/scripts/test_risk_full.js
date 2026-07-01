import dotenv from 'dotenv';
dotenv.config();
import { analyzeTransactionRisk } from './services/intelligenceEngine.js';

const result = await analyzeTransactionRisk({
  buyerWallet: '0xF39E2c522c53C4e0bD67CE84d95868CdFcb91B86',
  walletAgeDays: 365,
  targetContract: '0x6eBd241a46A31D03dFFC34DB97A8165F7Ce6aeCb',
  functionSignature: '0x',
  valueRequested: '0.001',
  asset: 'ETH',
  contextualHints: { isSelfTransfer: true, isRecipientKnownPlatformUser: true, senderVerified: true },
  contextNote: 'CRITICAL CONTEXT: This is an internal self-transfer between two wallets VERIFIED as belonging to the same user.'
});
console.log(JSON.stringify(result, null, 2));
process.exit(0);
