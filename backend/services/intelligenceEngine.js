/**
 * PayChain Intelligence Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Priority 1: Gemini (with automatic key rotation via MongoDB)
 *   - Tries each GEMINI_API_KEY_N in order, rotates on 429, wraps around
 *   - Saves active key index to MongoDB so restarts resume from last good key
 * Priority 2: Groq (Llama 3.3 70B) — fallback if ALL Gemini keys fail
 */

import { GoogleGenAI } from '@google/genai';
import {
  loadGeminiKeys,
  getActiveGeminiKey,
  rotateToNextGeminiKey,
  isQuotaError,
} from './keyRotationService.js';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

// ── Terminal color codes ───────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
};

const ts = () => new Date().toLocaleTimeString('en-US', { hour12: false });
const kPrev = (key) => key ? `${key.slice(0, 12)}...${key.slice(-4)}` : '???';

const log = {
  info: (tag, msg) => console.log(`${C.dim}[${ts()}]${C.reset} ${C.cyan}${C.bold}${tag}${C.reset} ${msg}`),
  success: (tag, msg) => console.log(`${C.dim}[${ts()}]${C.reset} ${C.green}${C.bold}${tag}${C.reset} ${msg}`),
  warn: (tag, msg) => console.warn(`${C.dim}[${ts()}]${C.reset} ${C.yellow}${C.bold}${tag}${C.reset} ${msg}`),
  error: (tag, msg) => console.error(`${C.dim}[${ts()}]${C.reset} ${C.red}${C.bold}${tag}${C.reset} ${msg}`),
  rotate: (tag, msg) => console.log(`${C.dim}[${ts()}]${C.reset} ${C.magenta}${C.bold}${tag}${C.reset} ${msg}`),
  rule: () => console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`),
};

// ── Shared prompt ──────────────────────────────────────────────────────────
const buildSystemPrompt = () => `You are PayChain AI, an expert blockchain security intelligence analyst. Analyze cryptocurrency transaction payloads and return a detailed, FAIR, and ACCURATE risk assessment as JSON.

## RISK SCORING RULES — FOLLOW STRICTLY:

### LOW RISK (Score 5–25, riskLevel: "Low"):
- Self-transfers between the user's OWN verified wallets (contextualHints.isSelfTransfer = true) — MUST be 5-20
- Small amounts (< 0.01 ETH) to known addresses
- Recipient is a verified platform user

### MODERATE RISK (Score 26–50, riskLevel: "Moderate"):
- Medium amounts to unknown addresses
- Recipient unknown but transaction looks normal
- Simple ETH transfer to an EOA (non-contract) address

### HIGH RISK (Score 51–75, riskLevel: "High"):
- Large amount (> 1 ETH) to a brand-new/unknown address
- Interaction with a smart contract (non-0x function signatures)
- Very new wallet (< 7 days) sending large amounts

### CRITICAL RISK (Score 76–100, riskLevel: "Critical"):
- Patterns matching known phishing/drainer contracts
- setApprovalForAll function signatures
- Very large value (> 10 ETH) to unknown contracts
- Rugpull or honeypot behavioral patterns

## IMPORTANT CONTEXT RULES:
- If contextualHints.isSelfTransfer === true → score MUST be 5-20, riskLevel MUST be "Low"
- If contextualHints.isRecipientKnownPlatformUser === true → reduce score by 15 points
- Pay extremely close attention to contextualHints.recipientHistorySummary:
  - If recipient history says "BRAND NEW or completely inactive wallet" AND amount is large, INCREASE score to High Risk (60+).
  - If recipient history indicates an "active history" and "established address", this is a POSITIVE signal. Reduce score appropriately.

## RESPONSE FORMAT (strict JSON, no markdown):
{
  "riskScore": <integer 0-100>,
  "riskLevel": <"Low" | "Moderate" | "High" | "Critical">,
  "riskCategory": <short label e.g. "Internal Transfer", "Unknown Recipient", "Safe Transaction">,
  "verdict": <1-2 sentence plain-English explanation of WHY this score was given>,
  "recommendation": <one of: "Safe to proceed" | "Proceed with caution" | "Double-check recipient" | "High risk – review carefully" | "Do not send – likely a scam">,
  "riskFactors": [<list of specific risk factors or positive safety signals>],
  "tips": [<2-3 specific actionable tips for this exact transaction>],
  "merchantAction": <"APPROVE" if score<30, "WARN_USER" if 30-75, "REJECT" if >75>
}`;

// ── 1. Gemini with key rotation ────────────────────────────────────────────
const callGeminiWithRotation = async (payload) => {
  const keys = loadGeminiKeys();
  if (!keys.length) {
    log.warn('⚠  Gemini', 'No GEMINI_API_KEY_N keys found in .env — skipping Gemini');
    return null;
  }

  let { index: startIndex, total } = await getActiveGeminiKey();
  let currentIndex = startIndex;
  let attempts = 0;

  log.rule();
  log.info('🔷 AI Request', `Starting analysis — ${total} Gemini key(s) available`);

  while (attempts < total) {
    const key = keys[currentIndex];
    log.info(
      `🔑 Gemini Key #${currentIndex + 1}/${total}`,
      `Key: ${key}  (attempt ${attempts + 1} of ${total})`
    );

    try {
      const t0 = Date.now();
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: [
          { role: 'user', parts: [{ text: buildSystemPrompt() + '\n\nTransaction payload:\n' + JSON.stringify(payload) }] }
        ],
        config: { temperature: 0.2, responseMimeType: 'application/json' }
      });

      const text = response.text?.trim();
      if (!text) throw new Error('Empty response from Gemini');

      const parsed = JSON.parse(text);
      log.success(
        `✅ Gemini Key #${currentIndex + 1}`,
        `Success in ${Date.now() - t0}ms — Risk: ${parsed.riskLevel} (${parsed.riskScore}/100)`
      );
      log.rule();
      return parsed;

    } catch (err) {
      const isQuota = isQuotaError(err);
      if (isQuota) {
        log.warn(`🚫 Gemini Key #${currentIndex + 1}`, `Quota/rate-limit exceeded: ${err.message}`);
      } else {
        log.error('❌ Gemini Error', `Invalid Key or Error: ${err.message?.slice(0, 120)} — rotating...`);
      }

      const prevIndex = currentIndex;
      currentIndex = await rotateToNextGeminiKey(currentIndex, total);
      log.rotate(
        '🔄 Key Rotation',
        `Key #${prevIndex + 1} → Key #${currentIndex + 1} (saved to MongoDB)`
      );
      attempts++;
    }
  }

  log.warn('⚠  Gemini', `All ${total} key(s) exhausted — AI unavailable`);
  log.rule();
  return null;
};

// ── 2. Groq fallback ───────────────────────────────────────────────────────
const callGroq = async (payload) => {
  const GROQ_KEY = process.env.GROK_API_KEY;
  if (!GROQ_KEY) {
    log.warn('⚠  Groq', 'GROK_API_KEY not set — Groq fallback unavailable');
    return null;
  }

  log.info('🟣 Groq Fallback', `Using Llama 3.3 70B (key: ${kPrev(GROQ_KEY)})`);
  const t0 = Date.now();

  const response = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: JSON.stringify(payload) }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from Groq');

  const parsed = JSON.parse(content);
  log.success(
    '✅ Groq Fallback',
    `Success in ${Date.now() - t0}ms — Risk: ${parsed.riskLevel} (${parsed.riskScore}/100)`
  );
  log.rule();
  return parsed;
};

// ── 3. Main export ─────────────────────────────────────────────────────────
export const analyzeTransactionRisk = async (payload) => {
  try {
    const geminiResult = await callGeminiWithRotation(payload);
    if (geminiResult) return geminiResult;

    log.error('❌ AI Engine', 'All AI services unavailable — returning aiUnavailable');
    log.rule();
    return {
      aiUnavailable: true,
      aiError: 'The AI model is currently unavailable due to technical issues. Transaction analysis will resume once the service is restored.',
    };

  } catch (error) {
    log.error('❌ AI Engine', `Unhandled error: ${error.message?.slice(0, 150)}`);
    log.rule();
    const isQuota = isQuotaError(error);
    return {
      aiUnavailable: true,
      aiError: isQuota
        ? 'The AI risk engine is temporarily rate-limited. Please try again in a few seconds.'
        : 'The AI risk engine is currently unavailable. Please try again in a moment.',
    };
  }
};
