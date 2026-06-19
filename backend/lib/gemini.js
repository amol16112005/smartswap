const { GoogleGenAI } = require('@google/genai');
const { buildOfflineFallback } = require('./offlineFallback');
const { SYSTEM_INSTRUCTION, GEMINI_MODELS } = require('../config/geminiPrompt');
const { LruCache, normalizePlanKey } = require('./cache');

const optimizationCache = new LruCache({
    maxSize: 150,
    ttlMs: Number(process.env.OPTIMIZE_CACHE_TTL_MS) || 15 * 60 * 1000
});

function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
        throw new Error('GEMINI_API_KEY is missing from .env');
    }
    return new GoogleGenAI({ apiKey: apiKey.trim() });
}

function geminiErrorMessage(error) {
    return String(error?.message || '');
}

function isRetryableGeminiError(error) {
    if (!error) return false;
    if (error.status === 503) return true;
    const msg = geminiErrorMessage(error);
    return /high demand|503|UNAVAILABLE|overloaded/i.test(msg);
}

function isModelSkipError(error) {
    if (!error) return false;
    if (error.status === 404) return true;
    const msg = geminiErrorMessage(error);
    return /not found|does not exist|invalid model|model.*not.*support/i.test(msg);
}

function isFatalGeminiError(error) {
    if (!error) return false;
    if (isRetryableGeminiError(error)) return false;
    if (error.status === 401 || error.status === 403) return true;
    const msg = geminiErrorMessage(error);
    return /API_KEY_INVALID|invalid api key|permission denied/i.test(msg);
}

function isPerModelQuotaError(error) {
    if (!error) return false;
    if (error.status === 429) return true;
    const msg = geminiErrorMessage(error);
    return /quota exceeded|resource exhausted|rate limit/i.test(msg);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiApi(userPlan) {
    const maxRetriesPerModel = 2;
    const baseDelayMs = 1500;
    let lastError = null;
    const ai = getGeminiClient();

    for (const model of GEMINI_MODELS) {
        for (let attempt = 0; attempt < maxRetriesPerModel; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    contents: userPlan,
                    config: {
                        systemInstruction: SYSTEM_INSTRUCTION,
                        responseMimeType: 'application/json'
                    }
                });
                if (model !== GEMINI_MODELS[0]) {
                    console.log(`Gemini fallback succeeded with model: ${model}`);
                }
                return { text: response.text, offlineFallback: false, fallbackReason: null };
            } catch (error) {
                lastError = error;
                if (isFatalGeminiError(error)) throw error;
                if (isModelSkipError(error) || isPerModelQuotaError(error)) {
                    console.warn(`Gemini model ${model} unavailable for this key, trying next model...`);
                    break;
                }
                if (!isRetryableGeminiError(error)) {
                    console.warn(`Gemini ${model} non-retryable error, trying next model...`);
                    break;
                }
                const delay = baseDelayMs * Math.pow(2, attempt);
                console.warn(
                    `Gemini ${model} temporarily busy (attempt ${attempt + 1}/${maxRetriesPerModel}). ` +
                    `Retrying in ${delay}ms...`
                );
                if (attempt < maxRetriesPerModel - 1) await sleep(delay);
            }
        }
    }

    const reason = isPerModelQuotaError(lastError)
        ? 'All configured Gemini models returned quota or rate-limit errors for this API key.'
        : 'All configured Gemini models were temporarily unavailable.';
    console.warn(`${reason} Serving offline fallback response.`);
    return {
        text: JSON.stringify(buildOfflineFallback(userPlan)),
        offlineFallback: true,
        fallbackReason: reason
    };
}

async function generateOptimization(userPlan) {
    const cacheKey = normalizePlanKey(userPlan);
    const cached = optimizationCache.get(cacheKey);
    if (cached) {
        return { ...cached, cached: true };
    }

    if (!process.env.GEMINI_API_KEY?.trim()) {
        const result = {
            text: JSON.stringify(buildOfflineFallback(userPlan)),
            offlineFallback: true,
            fallbackReason: 'GEMINI_API_KEY not configured',
            cached: false
        };
        optimizationCache.set(cacheKey, result);
        return result;
    }

    const result = await callGeminiApi(userPlan);
    optimizationCache.set(cacheKey, result);
    return { ...result, cached: false };
}

module.exports = {
    GEMINI_MODELS,
    generateOptimization,
    geminiErrorMessage,
    isRetryableGeminiError,
    isFatalGeminiError,
    isModelSkipError,
    isPerModelQuotaError,
    optimizationCache
};