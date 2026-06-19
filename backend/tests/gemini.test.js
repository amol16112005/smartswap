const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
    isRetryableGeminiError,
    isFatalGeminiError,
    isModelSkipError,
    isPerModelQuotaError
} = require('../lib/gemini');

describe('Gemini error classification', () => {
    it('detects retryable 503 errors', () => {
        assert.equal(isRetryableGeminiError({ status: 503 }), true);
        assert.equal(isRetryableGeminiError({ message: 'high demand' }), true);
    });

    it('detects fatal auth errors', () => {
        assert.equal(isFatalGeminiError({ status: 401 }), true);
        assert.equal(isFatalGeminiError({ message: 'API_KEY_INVALID' }), true);
    });

    it('does not treat retryable errors as fatal', () => {
        assert.equal(isFatalGeminiError({ status: 503 }), false);
    });

    it('detects model skip and quota errors', () => {
        assert.equal(isModelSkipError({ status: 404 }), true);
        assert.equal(isPerModelQuotaError({ status: 429 }), true);
        assert.equal(isPerModelQuotaError({ message: 'quota exceeded' }), true);
    });
});