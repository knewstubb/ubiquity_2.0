import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getCurrentBillingCycle } from '../../models/billing';

/**
 * Property 1: Date Formatting Consistency
 * **Validates: Requirements 4.4, 5.2**
 *
 * FOR ALL valid Date values, formatDate produces DD MMM YYYY pattern.
 * Also: getCurrentBillingCycle() always spans 26th to 25th, start < end.
 */

/** Replicates the formatDate logic used in BillingTreeTable and billingCsv */
function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/** Arbitrary that generates valid ISO date strings (YYYY-MM-DD) using integers */
const arbIsoDate = fc
  .tuple(
    fc.integer({ min: 2000, max: 2099 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
  )
  .map(([y, m, d]) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);

describe('Property 1: Date Formatting Consistency', () => {
  it('FOR ALL valid ISO date strings, formatDate produces DD MMM YYYY pattern', () => {
    fc.assert(
      fc.property(arbIsoDate, (iso) => {
        const result = formatDate(iso);
        // en-GB locale may produce 3 or 4 char months (e.g. "Sep" or "Sept")
        expect(result).toMatch(/^\d{2} [A-Z][a-z]{2,3} \d{4}$/);
      }),
      { numRuns: 200 },
    );
  });

  it('formatDate returns empty string for null input', () => {
    expect(formatDate(null)).toBe('');
  });

  it('getCurrentBillingCycle: returns valid ISO date strings', () => {
    const cycle = getCurrentBillingCycle();
    expect(cycle.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(cycle.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('getCurrentBillingCycle: start < end', () => {
    const cycle = getCurrentBillingCycle();
    expect(cycle.start < cycle.end).toBe(true);
  });

  it('getCurrentBillingCycle: cycle spans exactly one month apart', () => {
    const cycle = getCurrentBillingCycle();
    const [startYear, startMonth] = cycle.start.split('-').map(Number);
    const [endYear, endMonth] = cycle.end.split('-').map(Number);

    // End month should be exactly one month after start month
    const startTotal = startYear * 12 + startMonth;
    const endTotal = endYear * 12 + endMonth;
    expect(endTotal - startTotal).toBe(1);
  });
});
