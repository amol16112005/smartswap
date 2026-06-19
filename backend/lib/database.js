const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { LruCache } = require('./cache');

const localDbPath = path.join(__dirname, '..', 'history_db.json');
let dbConnected = false;
let localDbMemory = null;

const historyListCache = new LruCache({ maxSize: 200, ttlMs: 30 * 1000 });
const historyItemCache = new LruCache({ maxSize: 500, ttlMs: 60 * 1000 });

const HistorySchema = new mongoose.Schema({
    email: { type: String, required: true },
    query: { type: String, required: true },
    resolution: { type: String, required: true },
    data: { type: Object, required: true },
    timestamp: { type: Date, default: Date.now }
});

const History = mongoose.model('History', HistorySchema);

function initDatabase() {
    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) {
        console.log('No MONGODB_URI provided in .env. Operating in LOCAL FALLBACK MODE (history_db.json).');
        return;
    }

    mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, family: 4 })
        .then(() => {
            console.log('Successfully connected to MongoDB Atlas cloud database.');
            dbConnected = true;
        })
        .catch((err) => {
            console.error('Failed to connect to MongoDB Atlas:', err.message);
            console.log('Operating in LOCAL FALLBACK MODE (history_db.json).');
        });
}

function readLocalDb() {
    if (localDbMemory) return localDbMemory;
    try {
        if (!fs.existsSync(localDbPath)) {
            localDbMemory = [];
            fs.writeFileSync(localDbPath, JSON.stringify([], null, 2));
            return localDbMemory;
        }
        const fileContent = fs.readFileSync(localDbPath, 'utf8');
        localDbMemory = JSON.parse(fileContent || '[]');
        return localDbMemory;
    } catch (error) {
        console.error('Error reading local file database:', error.message);
        localDbMemory = [];
        return localDbMemory;
    }
}

function writeLocalDb(data) {
    try {
        localDbMemory = data;
        fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing to local file database:', error.message);
    }
}

function mapMongoRecord(record) {
    return {
        _id: record._id.toString(),
        email: record.email,
        query: record.query,
        resolution: record.resolution,
        data: record.data,
        timestamp: record.timestamp
    };
}

async function saveHistoryEntry({ email, query, resolution, data }) {
    historyListCache.delete(email);

    if (dbConnected) {
        try {
            const entry = new History({ email, query, resolution, data });
            const saved = await entry.save();
            const mapped = mapMongoRecord(saved);
            historyItemCache.set(mapped._id, mapped);
            return mapped;
        } catch (error) {
            console.error('Mongoose save failed, falling back to local file storage:', error.message);
        }
    }

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
    historyItemCache.set(newEntry._id, newEntry);
    return newEntry;
}

async function getHistoryByEmail(email) {
    const cached = historyListCache.get(email);
    if (cached) return cached;

    if (dbConnected) {
        try {
            const records = await History.find({ email })
                .select('email query resolution data timestamp')
                .sort({ timestamp: -1 })
                .lean();
            const mapped = records.map((r) => ({
                _id: r._id.toString(),
                email: r.email,
                query: r.query,
                resolution: r.resolution,
                data: r.data,
                timestamp: r.timestamp
            }));
            historyListCache.set(email, mapped);
            return mapped;
        } catch (error) {
            console.error('Mongoose find failed, falling back to local file storage:', error.message);
        }
    }

    const localDb = readLocalDb();
    const filtered = localDb.filter((r) => r.email === email);
    historyListCache.set(email, filtered);
    return filtered;
}

async function getHistoryById(id) {
    const cached = historyItemCache.get(id);
    if (cached) return cached;

    if (dbConnected && !id.startsWith('local_')) {
        try {
            const record = await History.findById(id)
                .select('email query resolution data timestamp')
                .lean();
            if (record) {
                const mapped = {
                    _id: record._id.toString(),
                    email: record.email,
                    query: record.query,
                    resolution: record.resolution,
                    data: record.data,
                    timestamp: record.timestamp
                };
                historyItemCache.set(id, mapped);
                return mapped;
            }
        } catch (error) {
            console.error('Mongoose findById failed, checking local file storage:', error.message);
        }
    }

    const localDb = readLocalDb();
    const entry = localDb.find((r) => r._id === id);
    if (entry) historyItemCache.set(id, entry);
    return entry;
}

async function deleteHistoryEntry(id) {
    const entry = await getHistoryById(id);
    if (entry) {
        historyListCache.delete(entry.email);
        historyItemCache.delete(id);
    }

    if (dbConnected && !id.startsWith('local_')) {
        try {
            const result = await History.findByIdAndDelete(id);
            if (result) return true;
        } catch (error) {
            console.error('Mongoose delete failed, trying local file storage:', error.message);
        }
    }

    const localDb = readLocalDb();
    const filtered = localDb.filter((r) => r._id !== id);
    if (filtered.length !== localDb.length) {
        writeLocalDb(filtered);
        return true;
    }
    return false;
}

function isDbConnected() {
    return dbConnected;
}

module.exports = {
    initDatabase,
    saveHistoryEntry,
    getHistoryByEmail,
    getHistoryById,
    deleteHistoryEntry,
    isDbConnected
};