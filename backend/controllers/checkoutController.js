import { analyzeTransactionRisk } from '../services/intelligenceEngine.js';

export const verifyCheckout = async (req, res) => {
  try {
    const { buyerWallet, walletAgeDays, targetContract, functionSignature, valueRequested } = req.body;

    if (!buyerWallet || !targetContract || !valueRequested) {
      return res.status(400).json({
        error: "Missing required transaction fields: buyerWallet, targetContract, and valueRequested are required."
      });
    }

    const payload = {
      buyerWallet,
      walletAgeDays: walletAgeDays || 0,
      targetContract,
      functionSignature: functionSignature || "0x",
      valueRequested
    };

    const riskAssessment = await analyzeTransactionRisk(payload);

    // Evaluate merchant action and return appropriate status
    // If REJECT, we might want to return a 403 Forbidden, but we can also return 200 with the payload so the frontend handles the rejection gracefully.
    const statusCode = riskAssessment.merchantAction === 'REJECT' ? 403 : 200;

    return res.status(statusCode).json(riskAssessment);

  } catch (error) {
    console.error("Checkout Verification Error:", error);
    return res.status(500).json({
      error: "Internal server error during transaction verification"
    });
  }
};
