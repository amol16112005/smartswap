const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeEmail, validateUserPlan } = require('../lib/validate');

describe('validate helpers', () => {
  it('normalizeEmail trims and lowercases valid emails', () => {
    assert.equal(normalizeEmail('  Tester@Example.COM  '), 'tester@example.com');
  });

  it('normalizeEmail rejects invalid input', () => {
    assert.equal(normalizeEmail('not-an-email'), null);
    assert.equal(normalizeEmail(''), null);
    assert.equal(normalizeEmail(null), null);
  });

  it('validateUserPlan trims and accepts plans with 3+ chars', () => {
    assert.equal(validateUserPlan('  buy phone  '), 'buy phone');
  });

  it('validateUserPlan rejects short or missing plans', () => {
    assert.equal(validateUserPlan('ab'), null);
    assert.equal(validateUserPlan(''), null);
    assert.equal(validateUserPlan(undefined), null);
  });
});