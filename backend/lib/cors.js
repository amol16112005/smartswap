const DEFAULT_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
    'http://localhost:5175'
];

function getAllowedOrigins() {
    return [
        ...DEFAULT_ORIGINS,
        process.env.FRONTEND_ORIGIN,
        process.env.RENDER_EXTERNAL_URL
    ].filter(Boolean);
}

function isAllowedCorsOrigin(origin, req, allowedOrigins = getAllowedOrigins()) {
    if (!origin) return true;
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost || allowedOrigins.includes(origin)) return true;
    const host = req?.headers?.host;
    if (host && (origin === `https://${host}` || origin === `http://${host}`)) return true;
    return false;
}

module.exports = { getAllowedOrigins, isAllowedCorsOrigin, DEFAULT_ORIGINS };