import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { useBillingReport } from '../../components/billing/useBillingReport';

/**
 * Property 4: Date Range Filter Correctness
 * **Validates: Requirements 5.3, 5.4, 5.5**
 *
 * FOR ALL items in filtered result, the relevant date falls within the selected range.
 */

/** Check whether two date ranges overlap (both inclusive). */
function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

/** Generate a YYYY-MM-DD string from year/month/day integers */
function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Arbitrary that generates a valid date range (start <= end) within a reasonable window */
const arbDateRange = fc
  .tuple(
    fc.integer({ min: 2024, max: 2026 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
    fc.integer({ min: 2024, max: 2026 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
  )
  .map(([y1, m1, d1, y2, m2, d2]) => {
    const isoA = toIso(y1, m1, d1);
    const isoB = toIso(y2, m2, d2);
    return isoA <= isoB ? { start: isoA, end: isoB } : { start: isoB, end: isoA };
  });

describe('Property 4: Date Range Filter Correctness', () => {
  it('FOR ALL items in filtered result, the relevant date falls within the selected range', () => {
    fc.assert(
      fc.property(arbDateRange, ({ start, end }) => {
        const { result } = renderHook(() => useBillingReport());

        act(() => {
          result.current.setStartDate(start);
          result.current.setEndDate(end);
        });

        for (const item of result.current.leafItems) {
          switch (item.category) {
            case 'Mailouts':
            case 'Automated Mailouts':
            case 'Form Triggered Emails':
            case 'Event Triggered Emails':
            case 'TXT Message Parts': {
              // sendDate must be within range
              expect(item.sendDate).toBeTruthy();
              expect(item.sendDate! >= start).toBe(true);
              expect(item.sendDate! <= end).toBe(true);
              break;
            }
            case 'Database Records':
            case 'Integration': {
              // billing cycle must overlap with selected range
              expect(item.billingCycleStart).toBeTruthy();
              expect(item.billingCycleEnd).toBeTruthy();
              expect(
                rangesOverlap(item.billingCycleStart!, item.billingCycleEnd!, start, end),
              ).toBe(true);
              break;
            }
            default: {
              // createdDate must be within range
              expect(item.createdDate >= start).toBe(true);
              expect(item.createdDate <= end).toBe(true);
              break;
            }
          }
        }
      }),
      { numRuns: 30 },
    );
  });
});
