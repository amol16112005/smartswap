import React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

afterEach(() => cleanup());

describe('App', () => {
  it('renders the landing page with main heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /smart swap/i })).toBeInTheDocument();
  });

  it('provides a skip link to main content', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveAttribute('href', '#main-content');
  });

  it('navigates to login and shows an accessible email field', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('link', { name: /operator login/i }));
    expect(screen.getByLabelText(/identity email address/i)).toBeInTheDocument();
  });

  it('exposes navigation landmarks', () => {
    render(<App />);
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});