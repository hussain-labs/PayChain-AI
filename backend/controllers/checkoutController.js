import { analyzeTransactionRisk } from '../services/intelligenceEngine.js';
import User from '../models/User.js';

export const verifyCheckout = async (req, res) => {
  try {
    const { buyerWallet, walletAgeDays, targetContract, functionSignature, valueRequested, asset } = req.body;

    if (!buyerWallet || !targetContract || !valueRequested) {
      return res.status(400).json({
        error: "Missing required transaction fields: buyerWallet, targetContract, and valueRequested are required."
      });
    }

    // Look up the logged-in user's saved wallets to detect self-transfers
    const currentUser = await User.findById(req.userId).select('savedWallets');
    const userWalletAddresses = currentUser
      ? currentUser.savedWallets.map(w => w.address.toLowerCase())
      : [];

    const senderIsOwned = userWalletAddresses.includes(buyerWallet.toLowerCase());
    const recipientIsOwned = userWalletAddresses.includes(targetContract.toLowerCase());
    const isSelfTransfer = senderIsOwned && recipientIsOwned;

    // Check if recipient belongs to ANY user in the system (trusted platform user)
    const recipientUser = await User.findOne({
      'savedWallets.address': { $regex: new RegExp(`^${targetContract}$`, 'i') }
    }).select('_id');
    const isRecipientKnown = !!recipientUser;

    const contextualHints = {
      senderWalletOwned: senderIsOwned,
      recipientWalletOwned: recipientIsOwned,
      isSelfTransfer,
      isRecipientKnownPlatformUser: isRecipientKnown,
    };

    let contextNote = "";
    if (isSelfTransfer) {
      contextNote = "CRITICAL CONTEXT: This is an internal self-transfer between two wallets VERIFIED as belonging to the same user in the PayChain system. The risk MUST be scored LOW (5-20). Do not flag this as suspicious.";
    } else if (recipientIsOwned) {
      contextNote = "Recipient is one of the user's own wallets.";
    } else if (isRecipientKnown) {
      contextNote = "Recipient address belongs to a verified PayChain platform user. This reduces risk somewhat.";
    } else {
      contextNote = "Recipient is an EXTERNAL, UNVERIFIED address. Apply thorough risk analysis based on transaction value, function signature, and behavioral patterns.";
    }

    const payload = {
      buyerWallet,
      walletAgeDays: walletAgeDays || 0,
      targetContract,
      functionSignature: functionSignature || "0x",
      valueRequested,
      asset: asset || 'ETH',
      contextualHints,
      contextNote
    };

    const riskAssessment = await analyzeTransactionRisk(payload);

    const statusCode = riskAssessment.merchantAction === 'REJECT' ? 403 : 200;
    return res.status(statusCode).json(riskAssessment);

  } catch (error) {
    console.error("Checkout Verification Error:", error);
    return res.status(500).json({
      error: "Internal server error during transaction verification"
    });
  }
};
