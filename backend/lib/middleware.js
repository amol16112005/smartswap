const rateLimit = require('express-rate-limit');

const optimizeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many optimization requests from this IP. Please try again later.' }
});

const historyLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many history requests. Slow down a bit.' }
});

function requestLogger(req, res, next) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
}

module.exports = { optimizeLimiter, historyLimiter, requestLogger };