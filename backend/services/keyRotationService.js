/**
 * Gemini API Key Rotation Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads all GEMINI_API_KEY_1, GEMINI_API_KEY_2, ... from .env
 * Stores the current active index in MongoDB (global, not per-user)
 * Auto-rotates on 429 / quota errors, wraps around from last → first
 */

import ApiKeyState from '../models/ApiKeyState.js';

const SERVICE = 'gemini';

// ── 1. Collect all GEMINI_API_KEY_N keys from environment ──────────────────
export const loadGeminiKeys = () => {
  const keys = [];
  let i = 1;
  while (process.env[`GEMINI_API_KEY_${i}`]) {
    keys.push(process.env[`GEMINI_API_KEY_${i}`].trim());
    i++;
  }
  // Also accept the legacy single key as key #1 if no numbered keys exist
  if (keys.length === 0 && process.env.GEMINI_API_KEY) {
    keys.push(process.env.GEMINI_API_KEY.trim());
  }
  return keys;
};

// ── 2. Read current active index from MongoDB ──────────────────────────────
export const getActiveIndex = async () => {
  try {
    const state = await ApiKeyState.findOneAndUpdate(
      { service: SERVICE },
      { $setOnInsert: { service: SERVICE, currentIndex: 0 } },
      { upsert: true, new: true }
    );
    return state.currentIndex ?? 0;
  } catch {
    return 0; // fallback to 0 if DB unavailable
  }
};

// ── 3. Save new active index to MongoDB ───────────────────────────────────
export const saveActiveIndex = async (index) => {
  try {
    await ApiKeyState.findOneAndUpdate(
      { service: SERVICE },
      { currentIndex: index, lastUpdated: new Date() },
      { upsert: true }
    );
  } catch (err) {
    console.error('[KeyRotation] Failed to save index to DB:', err.message);
  }
};

// ── 4. Get the currently active key ───────────────────────────────────────
export const getActiveGeminiKey = async () => {
  const keys = loadGeminiKeys();
  if (!keys.length) return null;

  const savedIndex = await getActiveIndex();
  const safeIndex = savedIndex % keys.length; // guard against stale index

  return { key: keys[safeIndex], index: safeIndex, total: keys.length };
};

// ── 5. Rotate to next key and persist ─────────────────────────────────────
export const rotateToNextKey = async (currentIndex, totalKeys) => {
  const nextIndex = (currentIndex + 1) % totalKeys;
  await saveActiveIndex(nextIndex);
  console.log(`[KeyRotation] Rotated Gemini key: ${currentIndex} → ${nextIndex} (of ${totalKeys})`);
  return nextIndex;
};

// ── 6. Helper: is this error a quota / rate-limit error? ──────────────────
export const isQuotaError = (err) => {
  const msg = err?.message || String(err);
  return (
    err?.status === 429 ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    msg.includes('rate')
  );
};
