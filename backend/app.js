const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const { getAllowedOrigins, isAllowedCorsOrigin } = require('./lib/cors');
const { requestLogger } = require('./lib/middleware');
const { initDatabase } = require('./lib/database');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const optimizeRoutes = require('./routes/optimize');
const historyRoutes = require('./routes/history');

function createApp() {
    const app = express();
    const allowedOrigins = getAllowedOrigins();

    app.set('trust proxy', 1);
    app.use(helmet());
    app.use(compression());
    app.use((req, res, next) => {
        cors({
            origin(origin, callback) {
                if (isAllowedCorsOrigin(origin, req, allowedOrigins)) {
                    callback(null, true);
                } else {
                    callback(new Error('CORS policy: Origin not allowed.'));
                }
            },
            credentials: true
        })(req, res, next);
    });
    app.use(express.json({ limit: '1mb' }));
    app.use(requestLogger);

    app.use('/api', healthRoutes.router);
    app.use('/api/auth', authRoutes);
    app.use('/api/optimize', optimizeRoutes);
    app.use('/api/history', historyRoutes);

    if (healthRoutes.hasBuiltFrontend) {
        app.use(express.static(healthRoutes.frontendDist, { index: false }));
        app.get(/^(?!\/api\/).*/, (req, res) => {
            res.sendFile(path.join(healthRoutes.frontendDist, 'index.html'));
        });
    } else {
        app.use((req, res) => {
            res.status(404).json({ error: 'Route not found on backend' });
        });
    }

    return app;
}

initDatabase();

module.exports = { createApp };