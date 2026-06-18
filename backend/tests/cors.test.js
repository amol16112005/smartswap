const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { isAllowedCorsOrigin, DEFAULT_ORIGINS } = require('../lib/cors');

describe('isAllowedCorsOrigin', () => {
  it('allows requests with no origin', () => {
    assert.equal(isAllowedCorsOrigin(undefined, {}), true);
  });

  it('allows localhost origins on any port', () => {
    assert.equal(isAllowedCorsOrigin('http://localhost:5173', {}), true);
    assert.equal(isAllowedCorsOrigin('http://127.0.0.1:3000', {}), true);
  });

  it('allows explicitly configured origins', () => {
    const allowed = ['https://smartswap.example.com'];
    assert.equal(
      isAllowedCorsOrigin('https://smartswap.example.com', {}, allowed),
      true
    );
  });

  it('allows same-host origins for same-origin deploys', () => {
    const req = { headers: { host: 'smartswap-8yvv.onrender.com' } };
    assert.equal(isAllowedCorsOrigin('https://smartswap-8yvv.onrender.com', req), true);
  });

  it('rejects unknown external origins', () => {
    assert.equal(isAllowedCorsOrigin('https://evil.example.com', {}), false);
  });

  it('exports default dev origins', () => {
    assert.ok(DEFAULT_ORIGINS.includes('http://localhost:5173'));
  });
});