import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { OptimizationResult } from './OptimizationResult';

const sampleResult = {
  efficiencyStats: { costRating: 'High Savings', carbonScore: '40% below average' },
  userOriginalWay: {
    costINR: 4200,
    qualityMetric: 'Convenient option',
    softSuggestion: 'Compare sellers first.',
  },
  smartAlternatives: [
    {
      badge: 'Cheapest',
      title: 'Off-peak train',
      costINR: 2100,
      carbonSavedPercent: 42,
      actionLink: 'https://example.com/deal',
    },
  ],
  isAlreadyOptimal: false,
};

afterEach(() => cleanup());

describe('OptimizationResult', () => {
  it('renders efficiency stats and alternatives', () => {
    render(<OptimizationResult result={sampleResult} />);
    expect(screen.getByText('High Savings')).toBeInTheDocument();
    expect(screen.getByText('Off-peak train')).toBeInTheDocument();
    expect(screen.getByText(/42% carbon footprint reduction/i)).toBeInTheDocument();
  });

  it('marks external action links as opening in a new tab', () => {
    render(<OptimizationResult result={sampleResult} />);
    const link = screen.getByRole('link', { name: /deploy off-peak train/i });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
  });
});