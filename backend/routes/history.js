const express = require('express');
const { authenticateToken } = require('../lib/auth');
const {
    getHistoryByEmail,
    getHistoryById,
    deleteHistoryEntry
} = require('../lib/database');
const { historyLimiter } = require('../lib/middleware');

const router = express.Router();

router.get('/', historyLimiter, authenticateToken, async (req, res) => {
    try {
        const historyList = await getHistoryByEmail(req.user.email);
        res.json(historyList);
    } catch (error) {
        console.error('Fetch History Error:', error);
        res.status(500).json({ error: 'Failed to retrieve history.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const entry = await getHistoryById(id);

        if (!entry) {
            return res.status(404).json({ error: 'Shared swap optimization not found.' });
        }

        res.set('Cache-Control', 'public, max-age=60');
        res.json(entry);
    } catch (error) {
        console.error('Fetch Shared Item Error:', error);
        res.status(500).json({ error: 'Failed to retrieve shared swap details.' });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const entry = await getHistoryById(id);

        if (!entry) {
            return res.status(404).json({ error: 'History item not found.' });
        }
        if (entry.email !== req.user.email) {
            return res.status(403).json({ error: 'Not authorized to delete this history item.' });
        }

        const success = await deleteHistoryEntry(id);
        if (!success) {
            return res.status(404).json({ error: 'History item not found or could not be deleted.' });
        }

        res.json({ success: true, message: 'History item successfully deleted.' });
    } catch (error) {
        console.error('Delete History Error:', error);
        res.status(500).json({ error: 'Failed to delete history item.' });
    }
});

module.exports = router;