import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config({ path: '/home/muzamil-hussain/Desktop/PAYCHAIN/PayChain-AI/backend/.env' });

try {
  const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
  const wallet = new ethers.Wallet(process.env.PLATFORM_PRIVATE_KEY, provider);
  console.log("Wallet address:", wallet.address);
} catch (err) {
  console.error("Ethers error:", err);
}
