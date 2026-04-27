import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { useBillingReport } from '../../components/billing/useBillingReport';
import { accounts } from '../../data/accounts';

/**
 * Property 5: Account Filter Correctness
 * **Validates: Requirements 6.3, 6.4**
 *
 * FOR ALL items in filtered result, accountId belongs to selected account or its descendants.
 */

const accountMap = new Map(accounts.map((a) => [a.id, a]));

/** Collect all descendant account IDs (inclusive of the given ID). */
function getDescendantIds(accountId: string): Set<string> {
  const result = new Set<string>();
  const queue = [accountId];
  while (queue.length > 0) {
    const id = queue.pop()!;
    result.add(id);
    const acc = accountMap.get(id);
    if (acc) {
      for (const childId of acc.childIds) {
        queue.push(childId);
      }
    }
  }
  return result;
}

/** Arbitrary that picks a random account ID from the accounts list */
const arbAccountId = fc.constantFrom(...accounts.map((a) => a.id));

describe('Property 5: Account Filter Correctness', () => {
  it('FOR ALL selected accounts, every filtered item belongs to that account or its descendants', () => {
    fc.assert(
      fc.property(arbAccountId, (selectedId) => {
        const { result } = renderHook(() => useBillingReport());

        act(() => {
          result.current.setSelectedAccountId(selectedId);
        });

        const allowedIds = getDescendantIds(selectedId);

        for (const item of result.current.leafItems) {
          expect(allowedIds.has(item.accountId)).toBe(true);
        }
      }),
      { numRuns: accounts.length * 2 },
    );
  });

  it('when no account is selected, all items are returned (no filtering)', () => {
    const { result } = renderHook(() => useBillingReport());
    // Default is null = all accounts
    expect(result.current.selectedAccountId).toBeNull();
    expect(result.current.leafItems.length).toBeGreaterThan(0);
  });
});
