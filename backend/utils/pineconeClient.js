import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

let pineconeClient = null;
let pineconeIndex = null;

export const initPinecone = () => {
  if (pineconeClient) return pineconeClient;

  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX || 'paychain-fraud';

  if (!apiKey) {
    console.warn('⚠️ PINECONE_API_KEY is not defined in .env. Pinecone client will not be initialized.');
    return null;
  }

  try {
    pineconeClient = new Pinecone({
      apiKey,
    });
    
    pineconeIndex = pineconeClient.Index(indexName);
    console.log(`🌲 Pinecone initialized with index: ${indexName}`);
    return pineconeClient;
  } catch (error) {
    console.error('Failed to initialize Pinecone:', error);
    return null;
  }
};

export const getPineconeIndex = () => {
  if (!pineconeIndex) {
    initPinecone();
  }
  return pineconeIndex;
};
