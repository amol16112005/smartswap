const express = require('express');
const { signToken } = require('../lib/auth');

const router = express.Router();

router.post('/login', (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const token = signToken(normalizedEmail);
    res.json({ token, email: normalizedEmail });
});

module.exports = router;