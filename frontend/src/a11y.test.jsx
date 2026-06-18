import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { OptimizationResult } from './components/OptimizationResult';

expect.extend(matchers);

afterEach(() => cleanup());

function renderAt(path, ui) {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
}

describe('Accessibility (axe)', () => {
  it('LandingPage has no detectable violations', async () => {
    const { container } = renderAt('/', <LandingPage />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('LoginPage has no detectable violations', async () => {
    const { container } = renderAt('/login', <LoginPage onLogin={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('OptimizationResult has no detectable violations', async () => {
    const { container } = render(
      <OptimizationResult
        result={{
          efficiencyStats: { costRating: 'Savings', carbonScore: '30% below average' },
          userOriginalWay: { costINR: 1000, qualityMetric: 'Standard option' },
          smartAlternatives: [
            {
              badge: 'Best',
              title: 'Local store pickup',
              costINR: 700,
              carbonSavedPercent: 25,
              actionLink: 'https://example.com',
            },
          ],
          isAlreadyOptimal: false,
        }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});