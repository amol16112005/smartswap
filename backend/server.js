require('dotenv').config();

const { createApp } = require('./app');
const { GEMINI_MODELS } = require('./lib/gemini');

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
    if (!process.env.JWT_SECRET) {
        console.error('FATAL: JWT_SECRET is required in production. Add it in Render → Environment.');
        process.exit(1);
    }
    if (!process.env.GEMINI_API_KEY?.trim()) {
        console.error('FATAL: GEMINI_API_KEY is required in production. Add it in Render → Environment.');
        process.exit(1);
    }
}

const app = createApp();

module.exports = { app };

if (require.main === module) {
    app.listen(PORT, () => {
        const key = process.env.GEMINI_API_KEY || '';
        const keyHint = key ? `${key.slice(0, 6)}...${key.slice(-4)}` : '(missing)';
        const { hasBuiltFrontend } = require('./routes/health');
        console.log(`SmartSwap Backend operating seamlessly on port ${PORT}`);
        console.log(`Environment: ${isProduction ? 'production' : 'development'} | frontend build: ${hasBuiltFrontend ? 'found' : 'missing'}`);
        console.log(`Gemini API key loaded: ${keyHint} | models: ${GEMINI_MODELS.join(', ')}`);
    });
}