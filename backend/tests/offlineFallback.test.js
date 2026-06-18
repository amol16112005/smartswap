const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { buildOfflineFallback } = require('../lib/offlineFallback');

describe('buildOfflineFallback', () => {
  it('returns generic fallback for unknown plans', () => {
    const result = buildOfflineFallback('office supplies');
    assert.equal(result.userOriginalWay.costINR, 5000);
    assert.equal(result.smartAlternatives.length, 2);
    assert.equal(result.isAlreadyOptimal, false);
  });

  it('detects travel plans and adjusts costs', () => {
    const result = buildOfflineFallback('Train trip from Mumbai to Delhi');
    assert.equal(result.userOriginalWay.title, 'Direct peak-time booking');
    assert.equal(result.userOriginalWay.costINR, 4200);
    assert.match(result.smartAlternatives[0].title, /train|bus/i);
  });

  it('detects gadget purchases', () => {
    const result = buildOfflineFallback('Buy new laptop on Amazon');
    assert.equal(result.userOriginalWay.costINR, 28000);
    assert.match(result.smartAlternatives[0].title, /refurbished/i);
  });

  it('detects food delivery plans', () => {
    const result = buildOfflineFallback('Order dinner on Swiggy');
    assert.equal(result.userOriginalWay.costINR, 650);
    assert.match(result.smartAlternatives[1].title, /home/i);
  });

  it('includes encoded search link for first alternative', () => {
    const plan = 'cement for house';
    const result = buildOfflineFallback(plan);
    assert.ok(result.smartAlternatives[0].actionLink.includes(encodeURIComponent(plan)));
  });

  it('always provides efficiency stats', () => {
    const result = buildOfflineFallback('anything');
    assert.ok(result.efficiencyStats.costRating);
    assert.ok(result.efficiencyStats.carbonScore);
  });
});