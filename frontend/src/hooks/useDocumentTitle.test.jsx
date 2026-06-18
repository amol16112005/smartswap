import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { useDocumentTitle } from './useDocumentTitle';

function TitleProbe({ title }) {
  useDocumentTitle(title);
  return null;
}

afterEach(() => {
  cleanup();
  document.title = 'SmartSwap';
});

describe('useDocumentTitle', () => {
  it('sets document.title on mount', () => {
    render(<TitleProbe title="SmartSwap — Dashboard" />);
    expect(document.title).toBe('SmartSwap — Dashboard');
  });

  it('updates document.title when title changes', () => {
    const { rerender } = render(<TitleProbe title="Page One" />);
    expect(document.title).toBe('Page One');
    rerender(<TitleProbe title="Page Two" />);
    expect(document.title).toBe('Page Two');
  });
});