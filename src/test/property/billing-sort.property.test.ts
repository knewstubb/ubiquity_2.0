import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { useBillingReport } from '../../components/billing/useBillingReport';
import { accounts } from '../../data/accounts';

/**
 * Property 2: Sort Stability — Ascending
 * Property 3: Sort Toggle — Descending is Reverse of Ascending
 * **Validates: Requirements 4.5, 4.6**
 */

const accountMap = new Map(accounts.map((a) => [a.id, a]));

/** Extract the comparable value for a given column from a billing line item */
function getColumnValue(
  item: {
    accountId: string;
    category: string;
    description: string;
    sendDate: string | null;
    items: number;
    createdDate: string;
    user: string;
  },
  column: string,
): string | number {
  switch (column) {
    case 'account':
      return accountMap.get(item.accountId)?.name ?? '';
    case 'type':
      return item.category;
    case 'description':
      return item.description;
    case 'sendDate':
      return item.sendDate ?? '';
    case 'items':
      return item.items;
    case 'createdDate':
      return item.createdDate;
    case 'user':
      return item.user;
    default:
      return '';
  }
}

const sortableColumns = ['account', 'type', 'description', 'sendDate', 'items', 'createdDate', 'user'];
const arbColumn = fc.constantFrom(...sortableColumns);

describe('Property 2: Sort ascending produces non-decreasing order', () => {
  it('FOR ALL sortable columns, ascending sort produces non-decreasing order', () => {
    fc.assert(
      fc.property(arbColumn, (column) => {
        const { result } = renderHook(() => useBillingReport());

        // Set sort to the column ascending
        act(() => {
          if (result.current.sortColumn !== column) {
            result.current.toggleSort(column);
          } else if (result.current.sortDirection !== 'asc') {
            result.current.toggleSort(column);
          }
        });

        const items = result.current.leafItems;
        for (let i = 1; i < items.length; i++) {
          const prev = getColumnValue(items[i - 1], column);
          const curr = getColumnValue(items[i], column);

          if (typeof prev === 'number' && typeof curr === 'number') {
            expect(prev).toBeLessThanOrEqual(curr);
          } else {
            const prevStr = String(prev);
            const currStr = String(curr);
            if (prevStr !== '' && currStr !== '') {
              expect(prevStr.localeCompare(currStr)).toBeLessThanOrEqual(0);
            }
          }
        }
      }),
      { numRuns: sortableColumns.length * 2 },
    );
  });
});

describe('Property 3: Sort descending is reverse of ascending', () => {
  it('FOR ALL sortable columns, descending sort produces non-increasing order', () => {
    fc.assert(
      fc.property(arbColumn, (column) => {
        const { result } = renderHook(() => useBillingReport());

        // First, set the column (toggleSort sets to asc on new column)
        act(() => {
          result.current.toggleSort(column);
        });

        // If column was already the default ('account'), first toggle went to desc.
        // If column was different, first toggle set it to asc.
        // We need to ensure we end up in desc.
        if (result.current.sortDirection === 'asc') {
          act(() => {
            result.current.toggleSort(column);
          });
        }

        expect(result.current.sortColumn).toBe(column);
        expect(result.current.sortDirection).toBe('desc');

        const items = result.current.leafItems;
        for (let i = 1; i < items.length; i++) {
          const prev = getColumnValue(items[i - 1], column);
          const curr = getColumnValue(items[i], column);

          if (typeof prev === 'number' && typeof curr === 'number') {
            expect(prev).toBeGreaterThanOrEqual(curr);
          } else {
            const prevStr = String(prev);
            const currStr = String(curr);
            // Empty strings sort to beginning in desc (end in asc → beginning in desc)
            if (prevStr !== '' && currStr !== '') {
              expect(prevStr.localeCompare(currStr)).toBeGreaterThanOrEqual(0);
            }
          }
        }
      }),
      { numRuns: sortableColumns.length * 2 },
    );
  });
});
