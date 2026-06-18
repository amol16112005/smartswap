import { describe, it, expect } from 'vitest';
import { apiUrl } from './config';

describe('apiUrl', () => {
  it('prefixes paths with a leading slash', () => {
    expect(apiUrl('api/health')).toMatch(/\/api\/health$/);
  });

  it('keeps paths that already start with /', () => {
    expect(apiUrl('/api/health')).toMatch(/\/api\/health$/);
  });
});