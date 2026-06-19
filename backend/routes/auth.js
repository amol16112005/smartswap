const express = require('express');
const { signToken } = require('../lib/auth');
const { normalizeEmail } = require('../lib/validate');

const router = express.Router();

router.post('/login', (req, res) => {
    const normalizedEmail = normalizeEmail(req.body?.email);
    if (!normalizedEmail) {
        return res.status(400).json({ error: 'A valid email address is required.' });
    }
    const token = signToken(normalizedEmail);
    res.json({ token, email: normalizedEmail });
});

module.exports = router;