const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const hasBuiltFrontend = fs.existsSync(frontendDist);

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

app.set('trust proxy', 1);

// Initialize the official Google Gen AI client (re-read key on each call via getter)
function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
        throw new Error('GEMINI_API_KEY is missing from .env');
    }
    return new GoogleGenAI({ apiKey: apiKey.trim() });
}

// ==========================================
// SECURITY LAYER SETUP (intact + smooth)
// ==========================================
app.use(helmet()); // Secure HTTP headers

// Tightened CORS (adjust origins for your deployment)
// Allow common Vite ports + any localhost port for dev (Vite auto-falls back to 5174/5175/etc when ports are busy)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:5175',
  process.env.FRONTEND_ORIGIN,
  process.env.RENDER_EXTERNAL_URL
].filter(Boolean);

function isAllowedCorsOrigin(origin, req) {
  if (!origin) return true;
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (isLocalhost || allowedOrigins.includes(origin)) return true;
  // Same-origin deploy: backend serves the built frontend from the same host
  const host = req?.headers?.host;
  if (host && (origin === `https://${host}` || origin === `http://${host}`)) return true;
  return false;
}

app.use((req, res, next) => {
  cors({
    origin: function (origin, callback) {
      if (isAllowedCorsOrigin(origin, req)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Origin not allowed.'));
      }
    },
    credentials: true
  })(req, res, next);
});

app.use(express.json({ limit: '1mb' })); // Reasonable body size limit

// Simple request logger (helps see if requests are reaching the backend)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// JWT secret (required for real auth)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-change-this-in-production';
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set in .env — using dev fallback. Set a strong secret before production use.');
}

// Rate limiters for smooth but protected experience
const optimizeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
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

// Auth middleware: verifies JWT and attaches user
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

// ==========================================
// DATABASE SETUP & FALLBACK MECHANISM
// ==========================================
const MONGODB_URI = process.env.MONGODB_URI;
let dbConnected = false;

if (MONGODB_URI && MONGODB_URI.trim() !== '') {
    mongoose.connect(MONGODB_URI.trim(), {
        serverSelectionTimeoutMS: 10000,
        family: 4
    })
        .then(() => {
            console.log('Successfully connected to MongoDB Atlas cloud database.');
            dbConnected = true;
        })
        .catch((err) => {
            console.error('Failed to connect to MongoDB Atlas:', err.message);
            console.log('Operating in LOCAL FALLBACK MODE (history_db.json).');
        });
} else {
    console.log('No MONGODB_URI provided in .env. Operating in LOCAL FALLBACK MODE (history_db.json).');
}

// 1. Mongoose History Schema
const HistorySchema = new mongoose.Schema({
    email: { type: String, required: true },
    query: { type: String, required: true },
    resolution: { type: String, required: true },
    data: { type: Object, required: true },
    timestamp: { type: Date, default: Date.now }
});

const History = mongoose.model('History', HistorySchema);

// 2. Local File Storage Database Helper (Fallback)
const localDbPath = path.join(__dirname, 'history_db.json');

function readLocalDb() {
    try {
        if (!fs.existsSync(localDbPath)) {
            fs.writeFileSync(localDbPath, JSON.stringify([], null, 2));
            return [];
        }
        const fileContent = fs.readFileSync(localDbPath, 'utf8');
        return JSON.parse(fileContent || '[]');
    } catch (error) {
        console.error('Error reading local file database:', error.message);
        return [];
    }
}

function writeLocalDb(data) {
    try {
        fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing to local file database:', error.message);
    }
}

// 3. Database operations with automatic fallback
async function saveHistoryEntry({ email, query, resolution, data }) {
    if (dbConnected) {
        try {
            const entry = new History({ email, query, resolution, data });
            const saved = await entry.save();
            return {
                _id: saved._id.toString(),
                email: saved.email,
                query: saved.query,
                resolution: saved.resolution,
                data: saved.data,
                timestamp: saved.timestamp
            };
        } catch (error) {
            console.error('Mongoose save failed, falling back to local file storage:', error.message);
        }
    }
    
    // File fallback
    const localDb = readLocalDb();
    const newEntry = {
        _id: 'local_' + Math.random().toString(36).substr(2, 9),
        email,
        query,
        resolution,
        data,
        timestamp: new Date().toISOString()
    };
    localDb.unshift(newEntry);
    writeLocalDb(localDb);
    return newEntry;
}

async function getHistoryByEmail(email) {
    if (dbConnected) {
        try {
            const records = await History.find({ email }).sort({ timestamp: -1 });
            return records.map(r => ({
                _id: r._id.toString(),
                email: r.email,
                query: r.query,
                resolution: r.resolution,
                data: r.data,
                timestamp: r.timestamp
            }));
        } catch (error) {
            console.error('Mongoose find failed, falling back to local file storage:', error.message);
        }
    }
    
    const localDb = readLocalDb();
    return localDb.filter(r => r.email === email);
}

async function getHistoryById(id) {
    // If it's a local mock ID or database connection is not established
    if (dbConnected && !id.startsWith('local_')) {
        try {
            const record = await History.findById(id);
            if (record) {
                return {
                    _id: record._id.toString(),
                    email: record.email,
                    query: record.query,
                    resolution: record.resolution,
                    data: record.data,
                    timestamp: record.timestamp
                };
            }
        } catch (error) {
            console.error('Mongoose findById failed, checking local file storage:', error.message);
        }
    }
    
    const localDb = readLocalDb();
    return localDb.find(r => r._id === id);
}

async function deleteHistoryEntry(id) {
    if (dbConnected && !id.startsWith('local_')) {
        try {
            const result = await History.findByIdAndDelete(id);
            if (result) return true;
        } catch (error) {
            console.error('Mongoose delete failed, trying local file storage:', error.message);
        }
    }
    
    const localDb = readLocalDb();
    const filtered = localDb.filter(r => r._id !== id);
    if (filtered.length !== localDb.length) {
        writeLocalDb(filtered);
        return true;
    }
    return false;
}

// ==========================================
// SYSTEM PROMPT FOR AI ENGINE
// ==========================================
const systemInstruction = `
You are a rapid-choice Multi-Variable Value Optimization Engine. Your job is to intercept a user's everyday consumer plan, instantly generate exactly 2 low-cost alternatives, and analyze their original path. 

CORE RULES:
1. Prioritize immediate, lower-cost consumer-friendly alternatives that maintain identical quality. 
2. Lowering carbon emissions is a hidden metric—do not mention it in the title or text descriptions; only output it as a calculated bonus percentage.
3. If the user's plan is already the most optimized, cheapest, and lowest-carbon method available, set 'isAlreadyOptimal' to true. In this case, provide a friendly celebration message and leave the smartAlternatives array completely empty.
4. Keep all textual quality descriptions under 5 words for quick decision-making.

You must return EXCLUSIVELY a valid, un-nested JSON object matching this exact schema structure:
{
  "isAlreadyOptimal": false,
  "celebrationMessage": "A quick, validating 1-sentence applause for their efficiency choice.",
  "efficiencyStats": {
    "costRating": "Optimal Savings",
    "carbonScore": "90% below average"
  },
  "userOriginalWay": {
    "title": "Name of original plan",
    "costINR": 500,
    "qualityMetric": "3-5 word baseline assurance",
    "softSuggestion": "A helpful optimization tip if they still choose this path."
  },
  "smartAlternatives": [
    {
      "badge": "Cheapest Choice",
      "title": "Alternative Name",
      "costINR": 250,
      "carbonSavedPercent": 70,
      "qualityAssurance": "3-5 words verifying experience",
      "actionButtonText": "Short action label",
      "actionLink": "https://example.com"
    }
  ]
}
`;

// Prefer models that still have free-tier quota; older 2.0 models often show limit: 0
const GEMINI_MODELS = (process.env.GEMINI_MODEL
    ? [process.env.GEMINI_MODEL]
    : [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite'
    ]);

function geminiErrorMessage(error) {
    return String(error?.message || '');
}

function isRetryableGeminiError(error) {
    if (!error) return false;
    // Never retry quota/auth failures — only transient overload (503)
    if (error.status === 503) return true;
    const msg = geminiErrorMessage(error);
    return /high demand|503|UNAVAILABLE|overloaded/i.test(msg);
}

function isModelSkipError(error) {
    if (!error) return false;
    if (error.status === 404) return true;
    const msg = geminiErrorMessage(error);
    return /not found|does not exist|invalid model|model.*not.*support/i.test(msg);
}

function isFatalGeminiError(error) {
    if (!error) return false;
    if (isRetryableGeminiError(error)) return false;
    if (error.status === 401 || error.status === 403) return true;
    const msg = geminiErrorMessage(error);
    return /API_KEY_INVALID|invalid api key|permission denied/i.test(msg);
}

function isPerModelQuotaError(error) {
    if (!error) return false;
    if (error.status === 429) return true;
    const msg = geminiErrorMessage(error);
    return /quota exceeded|resource exhausted|rate limit/i.test(msg);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function buildOfflineFallback(userPlan) {
    const lower = userPlan.toLowerCase();
    let originalCost = 5000;
    let altCost = 3200;
    let originalTitle = 'Your original plan';
    let altTitle = 'Lower-cost alternative';
    let alt2Title = 'Second-hand / local swap';

    if (/trip|travel|flight|train|bus|mumbai|delhi|goa|bangalore/i.test(lower)) {
        originalCost = 4200;
        altCost = 2100;
        originalTitle = 'Direct peak-time booking';
        altTitle = 'Off-peak train / bus';
        alt2Title = 'Carpool or shared ride';
    } else if (/phone|laptop|tablet|gadget|amazon|flipkart|buy|order/i.test(lower)) {
        originalCost = 28000;
        altCost = 19500;
        originalTitle = 'Brand-new retail purchase';
        altTitle = 'Certified refurbished unit';
        alt2Title = 'Exchange + refurbished deal';
    } else if (/food|grocery|swiggy|zomato|restaurant/i.test(lower)) {
        originalCost = 650;
        altCost = 380;
        originalTitle = 'Delivery from premium outlet';
        altTitle = 'Pickup from local store';
        alt2Title = 'Meal prep at home';
    }

    return {
        isAlreadyOptimal: false,
        celebrationMessage: '',
        efficiencyStats: {
            costRating: 'Estimated Savings',
            carbonScore: '35% below average'
        },
        userOriginalWay: {
            title: originalTitle,
            costINR: originalCost,
            qualityMetric: 'Familiar convenient option',
            softSuggestion: 'Compare 2–3 sellers before you commit.'
        },
        smartAlternatives: [
            {
                badge: 'Cheapest Choice',
                title: altTitle,
                costINR: altCost,
                carbonSavedPercent: 42,
                qualityAssurance: 'Same outcome less spend',
                actionButtonText: 'Explore option',
                actionLink: `https://www.google.com/search?q=${encodeURIComponent(userPlan)}`
            },
            {
                badge: 'Eco Bonus',
                title: alt2Title,
                costINR: Math.round(altCost * 0.72),
                carbonSavedPercent: 68,
                qualityAssurance: 'Lower footprint same need',
                actionButtonText: 'Browse listings',
                actionLink: 'https://www.olx.in'
            }
        ]
    };
}

async function generateOptimization(userPlan) {
    const maxRetriesPerModel = 2;
    const baseDelayMs = 1500;
    let lastError = null;
    const ai = getGeminiClient();

    for (const model of GEMINI_MODELS) {
        for (let attempt = 0; attempt < maxRetriesPerModel; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    contents: userPlan,
                    config: {
                        systemInstruction: systemInstruction,
                        responseMimeType: 'application/json'
                    }
                });
                if (model !== GEMINI_MODELS[0]) {
                    console.log(`Gemini fallback succeeded with model: ${model}`);
                }
                return { text: response.text, offlineFallback: false, fallbackReason: null };
            } catch (error) {
                lastError = error;
                if (isFatalGeminiError(error)) {
                    throw error;
                }
                if (isModelSkipError(error) || isPerModelQuotaError(error)) {
                    console.warn(`Gemini model ${model} unavailable for this key, trying next model...`);
                    break;
                }
                if (!isRetryableGeminiError(error)) {
                    console.warn(`Gemini ${model} non-retryable error, trying next model...`);
                    break;
                }
                const delay = baseDelayMs * Math.pow(2, attempt);
                console.warn(
                    `Gemini ${model} temporarily busy (attempt ${attempt + 1}/${maxRetriesPerModel}). ` +
                    `Retrying in ${delay}ms...`
                );
                if (attempt < maxRetriesPerModel - 1) {
                    await sleep(delay);
                }
            }
        }
    }

    const reason = isPerModelQuotaError(lastError)
        ? 'All configured Gemini models returned quota or rate-limit errors for this API key.'
        : 'All configured Gemini models were temporarily unavailable.';
    console.warn(`${reason} Serving offline fallback response.`);
    return {
        text: JSON.stringify(buildOfflineFallback(userPlan)),
        offlineFallback: true,
        fallbackReason: reason
    };
}

// ==========================================
// API ROUTES
// ==========================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: isProduction ? 'production' : 'development',
        database: dbConnected ? 'mongodb' : 'local-file',
        frontend: hasBuiltFrontend ? 'built' : 'missing',
        timestamp: new Date().toISOString()
    });
});

// Real lightweight auth endpoint (smooth experience: just email → real JWT)
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const token = jwt.sign({ email: normalizedEmail }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, email: normalizedEmail });
});

// 1. Optimize Sourcing & Save to History
app.post('/api/optimize', optimizeLimiter, async (req, res) => {
    try {
        const { userPlan, email: bodyEmail } = req.body;

        if (!userPlan || typeof userPlan !== 'string' || userPlan.trim().length < 3) {
            return res.status(400).json({ error: 'User plan is required (min 3 characters).' });
        }

        // Resolve email securely: prefer valid JWT, fall back to body email (for legacy/guest)
        let effectiveEmail = null;
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    effectiveEmail = decoded.email;
                } catch (_) {
                    // invalid token — treat as guest
                }
            }
        }
        if (!effectiveEmail && bodyEmail && typeof bodyEmail === 'string' && bodyEmail.includes('@')) {
            effectiveEmail = bodyEmail.trim().toLowerCase();
        }

        const response = await generateOptimization(userPlan);
        const optimizationData = JSON.parse(response.text);
        
        let savedEntry = null;
        if (effectiveEmail) {
            const resolution = optimizationData.isAlreadyOptimal 
                ? 'Verified Already Optimal' 
                : `Swapped to ${optimizationData.smartAlternatives?.[0]?.title || 'Alternative'}`;
            
            savedEntry = await saveHistoryEntry({
                email: effectiveEmail,
                query: userPlan,
                resolution,
                data: optimizationData
            });
        }

        res.json({
            optimization: optimizationData,
            historyEntry: savedEntry,
            offlineFallback: response.offlineFallback,
            fallbackReason: response.fallbackReason || null
        });

    } catch (error) {
        console.error('Gemini Backend Error:', error);
        const isBusy = isRetryableGeminiError(error) || error.status === 503;
        const status = isBusy ? 503 : 500;
        const message = isBusy
            ? 'The AI engine is temporarily busy. Please wait a few seconds and try again.'
            : (error.message || 'Failed to process optimization.');
        res.status(status).json({ error: message });
    }
});

// 2. Fetch User History (protected: must be authenticated owner)
app.get('/api/history', historyLimiter, authenticateToken, async (req, res) => {
    try {
        // Always use the email from the verified token — never trust client query param
        const historyList = await getHistoryByEmail(req.user.email);
        res.json(historyList);
    } catch (error) {
        console.error('Fetch History Error:', error);
        res.status(500).json({ error: 'Failed to retrieve history.' });
    }
});

// 3. Fetch Single Shared History Item (Public Link)
app.get('/api/history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const entry = await getHistoryById(id);
        
        if (!entry) {
            return res.status(404).json({ error: 'Shared swap optimization not found.' });
        }
        
        res.json(entry);
    } catch (error) {
        console.error('Fetch Shared Item Error:', error);
        res.status(500).json({ error: 'Failed to retrieve shared swap details.' });
    }
});

// 4. Delete History Item (protected + ownership enforced)
app.delete('/api/history/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Ownership verification: only owner (from JWT) can delete
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

if (hasBuiltFrontend) {
    app.use(express.static(frontendDist, { index: false }));
    app.get(/^(?!\/api\/).*/, (req, res) => {
        res.sendFile(path.join(frontendDist, 'index.html'));
    });
} else {
    app.use((req, res) => {
        res.status(404).json({ error: 'Route not found on backend' });
    });
}

app.listen(PORT, () => {
    const key = process.env.GEMINI_API_KEY || '';
    const keyHint = key ? `${key.slice(0, 6)}...${key.slice(-4)}` : '(missing)';
    console.log(`SmartSwap Backend operating seamlessly on port ${PORT}`);
    console.log(`Environment: ${isProduction ? 'production' : 'development'} | frontend build: ${hasBuiltFrontend ? 'found' : 'missing'}`);
    console.log(`Gemini API key loaded: ${keyHint} | models: ${GEMINI_MODELS.join(', ')}`);
});