import { afterEach, describe, it, expect, vi } from 'vitest';
import { apiFetch, ApiError, clearStoredAuth } from './apiClient';

describe('apiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('parses successful JSON responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ token: 'abc', email: 'a@b.com' }),
    }));

    const { data } = await apiFetch('/api/auth/login', { method: 'POST', body: { email: 'a@b.com' } });
    expect(data.token).toBe('abc');
  });

  it('throws ApiError on failed responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Invalid email' }),
    }));

    await expect(apiFetch('/api/auth/login')).rejects.toThrow(ApiError);
  });

  it('clears stored auth on 401', async () => {
    localStorage.setItem('smartswap_auth', '{"email":"x@y.com","token":"t"}');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Unauthorized' }),
    }));

    await expect(apiFetch('/api/history', { token: 'bad' })).rejects.toThrow(/session expired/i);
    expect(localStorage.getItem('smartswap_auth')).toBeNull();
  });

  it('clearStoredAuth removes auth key', () => {
    localStorage.setItem('smartswap_auth', '{}');
    clearStoredAuth();
    expect(localStorage.getItem('smartswap_auth')).toBeNull();
  });
});