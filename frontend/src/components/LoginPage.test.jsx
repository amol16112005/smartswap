import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

afterEach(() => cleanup());

describe('LoginPage', () => {
  it('submits email through the labelled input', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ email: 'user@example.com', token: 'jwt-token' }),
    }));

    render(
      <MemoryRouter>
        <LoginPage onLogin={onLogin} />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/identity email address/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /authenticate identity/i }));

    expect(onLogin).toHaveBeenCalledWith({ email: 'user@example.com', token: 'jwt-token' });
  });
});