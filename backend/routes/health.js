const express = require('express');
const fs = require('fs');
const path = require('path');
const { isDbConnected } = require('../lib/database');

const router = express.Router();
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
const hasBuiltFrontend = fs.existsSync(frontendDist);

router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        database: isDbConnected() ? 'mongodb' : 'local-file',
        frontend: hasBuiltFrontend ? 'built' : 'missing',
        timestamp: new Date().toISOString()
    });
});

module.exports = { router, hasBuiltFrontend, frontendDist };