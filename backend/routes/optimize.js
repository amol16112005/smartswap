const express = require('express');
const { resolveEmailFromRequest } = require('../lib/auth');
const { validateUserPlan } = require('../lib/validate');
const { generateOptimization, isRetryableGeminiError } = require('../lib/gemini');
const { saveHistoryEntry } = require('../lib/database');
const { optimizeLimiter } = require('../lib/middleware');

const router = express.Router();

router.post('/', optimizeLimiter, async (req, res) => {
    try {
        const normalizedPlan = validateUserPlan(req.body?.userPlan);
        if (!normalizedPlan) {
            return res.status(400).json({ error: 'User plan is required (min 3 characters).' });
        }

        const effectiveEmail = resolveEmailFromRequest(req);
        const response = await generateOptimization(normalizedPlan);
        const optimizationData = JSON.parse(response.text);

        let savedEntry = null;
        if (effectiveEmail) {
            const resolution = optimizationData.isAlreadyOptimal
                ? 'Verified Already Optimal'
                : `Swapped to ${optimizationData.smartAlternatives?.[0]?.title || 'Alternative'}`;

            savedEntry = await saveHistoryEntry({
                email: effectiveEmail,
                query: normalizedPlan,
                resolution,
                data: optimizationData
            });
        }

        res.set('X-Cache', response.cached ? 'HIT' : 'MISS');
        res.json({
            optimization: optimizationData,
            historyEntry: savedEntry,
            offlineFallback: response.offlineFallback,
            fallbackReason: response.fallbackReason || null,
            cached: Boolean(response.cached)
        });
    } catch (error) {
        console.error('Gemini Backend Error:', error);
        const isBusy = isRetryableGeminiError(error) || error.status === 503;
        const status = isBusy ? 503 : 500;
        const message = isBusy
            ? 'The AI engine is temporarily busy. Please wait a few seconds and try again.'
            : (error.message || 'Failed to process optimization.');
        res.status(status).json({ error: message });
    }
});

module.exports = router;