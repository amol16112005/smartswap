class LruCache {
    constructor({ maxSize = 100, ttlMs = 15 * 60 * 1000 } = {}) {
        this.maxSize = maxSize;
        this.ttlMs = ttlMs;
        this.store = new Map();
    }

    _isExpired(entry) {
        return Date.now() - entry.storedAt > this.ttlMs;
    }

    get(key) {
        const entry = this.store.get(key);
        if (!entry) return undefined;
        if (this._isExpired(entry)) {
            this.store.delete(key);
            return undefined;
        }
        this.store.delete(key);
        this.store.set(key, entry);
        return entry.value;
    }

    set(key, value) {
        if (this.store.has(key)) {
            this.store.delete(key);
        }
        this.store.set(key, { value, storedAt: Date.now() });
        if (this.store.size > this.maxSize) {
            const oldest = this.store.keys().next().value;
            this.store.delete(oldest);
        }
    }

    has(key) {
        return this.get(key) !== undefined;
    }

    delete(key) {
        return this.store.delete(key);
    }

    clear() {
        this.store.clear();
    }

    get size() {
        return this.store.size;
    }
}

function normalizePlanKey(userPlan) {
    return userPlan.trim().toLowerCase().replace(/\s+/g, ' ');
}

module.exports = { LruCache, normalizePlanKey };