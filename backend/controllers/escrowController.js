import Escrow from '../models/Escrow.js';
import User from '../models/User.js';
import { notifyUser } from '../utils/notify.js';
import { ethers } from 'ethers';

// Helper to get the Platform Wallet connected to Sepolia
const getPlatformWallet = () => {
  if (!process.env.PLATFORM_PRIVATE_KEY) {
    throw new Error("PLATFORM_PRIVATE_KEY is not defined in environment variables. Please check your .env file and restart the server.");
  }
  const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
  return new ethers.Wallet(process.env.PLATFORM_PRIVATE_KEY, provider);
};

// GET /api/escrows
// Get all escrows for the logged-in user
export const getEscrows = async (req, res) => {
  try {
    const escrows = await Escrow.find({
      $or: [
        { user: req.userId },
        { buyerUserId: req.userId },
        { sellerUserId: req.userId }
      ]
    }).sort({ createdAt: -1 });
    res.json(escrows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch escrows' });
  }
};

// POST /api/escrows
// Create a new escrow contract
export const createEscrow = async (req, res) => {
  try {
    const { title, description, amount, asset, buyerWallet, sellerWallet, role } = req.body;

    if (!title || !amount || !asset || !buyerWallet || !sellerWallet || !role) {
      return res.status(400).json({ error: 'Missing required fields for Escrow' });
    }

    // Try to find users matching these wallet addresses in their savedWallets array
    const buyerUser = await User.findOne({ 'savedWallets.address': buyerWallet });
    const sellerUser = await User.findOne({ 'savedWallets.address': sellerWallet });

    // Use the Platform Wallet address as the secure holding contract
    const platformWallet = getPlatformWallet();
    const contractAddress = platformWallet.address;

    const newEscrow = await Escrow.create({
      title,
      description,
      amount,
      asset,
      buyerWallet,
      sellerWallet,
      buyerUserId: buyerUser ? buyerUser._id : null,
      sellerUserId: sellerUser ? sellerUser._id : null,
      user: req.userId,
      role,
      status: 'awaiting_funds',
      contractAddress
    });

    await notifyUser(req.userId, `Smart Contract Generated: ${title} Escrow deployed at ${contractAddress.slice(0,6)}...${contractAddress.slice(-4)}`, '/escrow');
    
    // Notify counterparty if found
    if (role === 'buyer' && sellerUser && sellerUser._id.toString() !== req.userId) {
      await notifyUser(sellerUser._id, `New Escrow Contract deployed by buyer for ${title}`, '/escrow');
    } else if (role === 'seller' && buyerUser && buyerUser._id.toString() !== req.userId) {
      await notifyUser(buyerUser._id, `New Escrow Contract deployed by merchant for ${title}`, '/escrow');
    }

    res.status(201).json(newEscrow);
  } catch (error) {
    console.error('Error creating escrow:', error);
    res.status(500).json({ error: 'Failed to deploy Escrow smart contract', details: error.message, stack: error.stack });
  }
};

// PUT /api/escrows/:id/status
// Update escrow status (simulate funding, delivery, release)
export const updateEscrowStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const escrowId = req.params.id;

    if (!['awaiting_funds', 'funded', 'in_transit', 'delivered', 'released', 'disputed', 'refunded'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const escrow = await Escrow.findById(escrowId);
    if (!escrow) return res.status(404).json({ error: 'Escrow not found' });

    // If releasing funds, we must execute the Web3 transfer from Platform -> Seller
    if (status === 'released') {
      try {
        const platformWallet = getPlatformWallet();
        const amountToTransfer = ethers.parseEther(escrow.amount.toString());

        // Estimate gas fees
        const feeData = await platformWallet.provider.getFeeData();
        const gasLimit = 21000n; // Standard ETH transfer
        const maxFeePerGas = feeData.maxFeePerGas || feeData.gasPrice || 3000000000n; // Use maxFeePerGas for calculation
        const gasCost = gasLimit * maxFeePerGas;
        
        // Deduct gas from the amount we forward
        const finalAmount = amountToTransfer - gasCost;

        if (finalAmount <= 0n) {
          return res.status(400).json({ error: 'Amount too small to cover network gas.' });
        }

        console.log(`Broadcasting release transaction to seller: ${escrow.sellerWallet}`);
        const tx = await platformWallet.sendTransaction({
          to: escrow.sellerWallet,
          value: finalAmount,
          gasLimit: gasLimit,
          maxFeePerGas: maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || 1500000000n
        });
        console.log(`Funds released! TxHash: ${tx.hash}`);

      } catch (txError) {
        console.error('Failed to process release transaction:', txError);
        return res.status(500).json({ error: 'Failed to execute blockchain transfer. Please ensure the Platform Wallet has sufficient funds.' });
      }
    } else if (status === 'refunded') {
      try {
        const platformWallet = getPlatformWallet();
        const amountToTransfer = ethers.parseEther(escrow.amount.toString());

        // Estimate gas fees
        const feeData = await platformWallet.provider.getFeeData();
        const gasLimit = 21000n; // Standard ETH transfer
        const maxFeePerGas = feeData.maxFeePerGas || feeData.gasPrice || 3000000000n; // Use maxFeePerGas for calculation
        const gasCost = gasLimit * maxFeePerGas;
        
        // Deduct gas from the amount we forward
        const finalAmount = amountToTransfer - gasCost;

        if (finalAmount <= 0n) {
          return res.status(400).json({ error: 'Amount too small to cover network gas.' });
        }

        console.log(`Broadcasting refund transaction to buyer: ${escrow.buyerWallet}`);
        const tx = await platformWallet.sendTransaction({
          to: escrow.buyerWallet,
          value: finalAmount,
          gasLimit: gasLimit,
          maxFeePerGas: maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || 1500000000n
        });
        console.log(`Funds refunded! TxHash: ${tx.hash}`);

      } catch (txError) {
        console.error('Failed to process refund transaction:', txError);
        return res.status(500).json({ error: 'Failed to execute blockchain refund transfer. Please ensure the Platform Wallet has sufficient funds.' });
      }
    }

    escrow.status = status;
    await escrow.save();

    await notifyUser(escrow.user, `Escrow Status Update: ${escrow.title} is now ${status.replace('_', ' ')}`, '/escrow');

    res.json(escrow);
  } catch (error) {
    console.error('Error updating escrow:', error);
    res.status(500).json({ error: 'Failed to update Escrow status' });
  }
};

// DELETE /api/escrows/:id
// Delete an escrow if funds are not issued (status is awaiting_funds)
export const deleteEscrow = async (req, res) => {
  try {
    const escrowId = req.params.id;
    const escrow = await Escrow.findById(escrowId);
    if (!escrow) return res.status(404).json({ error: 'Escrow not found' });
    
    // Check if the user is authorized (must be the creator or involved)
    if (escrow.user.toString() !== req.userId && escrow.buyerUserId?.toString() !== req.userId && escrow.sellerUserId?.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this escrow' });
    }

    if (escrow.status !== 'awaiting_funds') {
      return res.status(400).json({ error: 'Cannot delete escrow after funds are locked.' });
    }

    await Escrow.findByIdAndDelete(escrowId);
    res.json({ message: 'Escrow deleted successfully' });
  } catch (error) {
    console.error('Error deleting escrow:', error);
    res.status(500).json({ error: 'Failed to delete Escrow' });
  }
};
