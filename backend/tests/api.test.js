process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-for-unit-tests-only-32chars';
process.env.GEMINI_API_KEY = '';
process.env.MONGODB_URI = '';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../server');

describe('SmartSwap API', () => {
  it('GET /api/health returns ok status', async () => {
    const res = await request(app).get('/api/health').expect(200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.environment, 'test');
    assert.ok('database' in res.body);
    assert.ok('timestamp' in res.body);
  });

  it('POST /api/auth/login rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email' })
      .expect(400);
    assert.match(res.body.error, /valid email/i);
  });

  it('POST /api/auth/login returns JWT for valid email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tester@example.com' })
      .expect(200);
    assert.equal(res.body.email, 'tester@example.com');
    assert.ok(res.body.token);
  });

  it('POST /api/optimize rejects short plans', async () => {
    const res = await request(app)
      .post('/api/optimize')
      .send({ userPlan: 'ab' })
      .expect(400);
    assert.match(res.body.error, /min 3 characters/i);
  });

  it('POST /api/optimize returns optimization payload', async () => {
    const res = await request(app)
      .post('/api/optimize')
      .send({ userPlan: 'Train trip from Mumbai to Delhi next weekend' })
      .expect(200);
    assert.ok(res.body.optimization);
    assert.ok(res.body.optimization.userOriginalWay);
    assert.ok(Array.isArray(res.body.optimization.smartAlternatives));
  });

  it('GET /api/history requires authentication', async () => {
    const res = await request(app).get('/api/history').expect(401);
    assert.match(res.body.error, /token required/i);
  });

  it('GET /api/history returns list for authenticated user', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'history-user@example.com' });
    const res = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(200);
    assert.ok(Array.isArray(res.body));
  });

  it('GET /api/history/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/history/nonexistent-id-12345').expect(404);
    assert.ok(res.body.error);
  });

  it('POST /api/auth/login normalizes email to lowercase', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '  Tester@Example.COM  ' })
      .expect(200);
    assert.equal(res.body.email, 'tester@example.com');
  });

  it('GET /api/history rejects invalid tokens', async () => {
    const res = await request(app)
      .get('/api/history')
      .set('Authorization', 'Bearer invalid.token.value')
      .expect(403);
    assert.match(res.body.error, /invalid|expired/i);
  });

  it('POST /api/optimize saves history when email is provided', async () => {
    const res = await request(app)
      .post('/api/optimize')
      .send({
        userPlan: 'Weekend train from Mumbai to Pune',
        email: 'saver@example.com',
      })
      .expect(200);
    assert.ok(res.body.historyEntry);
    assert.equal(res.body.historyEntry.email, 'saver@example.com');
    assert.equal(res.body.offlineFallback, true);
  });

  it('DELETE /api/history/:id requires authentication', async () => {
    const res = await request(app).delete('/api/history/some-id').expect(401);
    assert.match(res.body.error, /token required/i);
  });

  it('POST /api/optimize rejects missing userPlan', async () => {
    const res = await request(app).post('/api/optimize').send({}).expect(400);
    assert.match(res.body.error, /required/i);
  });

  it('POST /api/optimize serves cached response for identical plans', async () => {
    const plan = 'Cached query: bus from Chennai to Bangalore';
    const first = await request(app)
      .post('/api/optimize')
      .send({ userPlan: plan })
      .expect(200);
    assert.equal(first.headers['x-cache'], 'MISS');

    const second = await request(app)
      .post('/api/optimize')
      .send({ userPlan: `  ${plan.toUpperCase()}  ` })
      .expect(200);
    assert.equal(second.headers['x-cache'], 'HIT');
    assert.equal(second.body.cached, true);
    assert.deepEqual(second.body.optimization, first.body.optimization);
  });
});