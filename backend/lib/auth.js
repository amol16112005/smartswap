const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-change-this-in-production';

if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  JWT_SECRET not set in .env — using dev fallback. Set a strong secret before production use.');
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication token required for this action.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired authentication token.' });
        }
        req.user = { email: decoded.email };
        next();
    });
}

function signToken(email) {
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
}

function resolveEmailFromRequest(req) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                return decoded.email;
            } catch {
                // invalid token — treat as guest
            }
        }
    }

    const bodyEmail = req.body?.email;
    if (bodyEmail && typeof bodyEmail === 'string' && bodyEmail.includes('@')) {
        return bodyEmail.trim().toLowerCase();
    }

    return null;
}

module.exports = { JWT_SECRET, authenticateToken, signToken, resolveEmailFromRequest };