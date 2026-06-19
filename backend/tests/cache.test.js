const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { LruCache, normalizePlanKey } = require('../lib/cache');

describe('LruCache', () => {
    it('stores and retrieves values', () => {
        const cache = new LruCache({ maxSize: 2, ttlMs: 60_000 });
        cache.set('a', { ok: true });
        assert.deepEqual(cache.get('a'), { ok: true });
    });

    it('evicts oldest entry when maxSize exceeded', () => {
        const cache = new LruCache({ maxSize: 2, ttlMs: 60_000 });
        cache.set('a', 1);
        cache.set('b', 2);
        cache.set('c', 3);
        assert.equal(cache.get('a'), undefined);
        assert.equal(cache.get('b'), 2);
        assert.equal(cache.get('c'), 3);
    });

    it('expires entries after ttl', () => {
        const cache = new LruCache({ maxSize: 5, ttlMs: 1 });
        cache.set('x', 'value');
        return new Promise((resolve) => {
            setTimeout(() => {
                assert.equal(cache.get('x'), undefined);
                resolve();
            }, 5);
        });
    });
});

describe('normalizePlanKey', () => {
    it('trims and lowercases plan text', () => {
        assert.equal(normalizePlanKey('  Buy PHONE  '), 'buy phone');
    });

    it('collapses repeated whitespace', () => {
        assert.equal(normalizePlanKey('train   trip'), 'train trip');
    });
});