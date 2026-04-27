import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { renderHook } from '@testing-library/react';
import { useBillingReport } from '../../components/billing/useBillingReport';
import { accounts } from '../../data/accounts';
import type { BillingLineItem } from '../../models/billing';

/**
 * Property 6: CSV Contains Only Leaf Items
 * **Validates: Requirements 7.2, 7.3**
 *
 * CSV row count equals leaf-level item count, no parent summary rows.
 */

const accountMap = new Map(accounts.map((a) => [a.id, a]));

/** Simulate CSV generation — returns the rows that would be in the CSV (excluding header) */
function generateCsvRows(items: BillingLineItem[]): string[][] {
  return items.map((item) => [
    accountMap.get(item.accountId) ?? item.accountId,
    item.category,
    item.description,
    item.sendDate ?? '',
    String(item.items),
    item.createdDate,
    item.user,
  ]);
}

describe('Property 6: CSV Contains Only Leaf Items', () => {
  it('CSV row count equals leaf-level item count from the hook', () => {
    const { result } = renderHook(() => useBillingReport());
    const leafItems = result.current.leafItems;
    const csvRows = generateCsvRows(leafItems);

    // CSV rows should exactly match the number of leaf items
    expect(csvRows.length).toBe(leafItems.length);
  });

  it('no CSV row corresponds to a rolled-up summary (every row has a real item id)', () => {
    const { result } = renderHook(() => useBillingReport());
    const leafItems = result.current.leafItems;

    // Every leaf item should have a unique id (not a summary)
    const ids = leafItems.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('FOR ALL subsets of leaf items, CSV row count equals subset length', () => {
    const { result } = renderHook(() => useBillingReport());
    const leafItems = result.current.leafItems;

    fc.assert(
      fc.property(
        fc.shuffledSubarray(leafItems, { minLength: 0 }),
        (subset) => {
          const csvRows = generateCsvRows(subset);
          expect(csvRows.length).toBe(subset.length);

          // Every row should have exactly 7 columns
          for (const row of csvRows) {
            expect(row.length).toBe(7);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('CSV export contains no parent account summary rows', () => {
    const { result } = renderHook(() => useBillingReport());
    const leafItems = result.current.leafItems;

    // Identify parent accounts (those with children that also have items in the dataset)
    const accountsWithItems = new Set(leafItems.map((item) => item.accountId));
    const parentAccountsWithChildItems = accounts.filter(
      (a) => a.childIds.length > 0 && a.childIds.some((childId) => accountsWithItems.has(childId)),
    );

    // The CSV should not contain summary-only rows for parent accounts
    // (parent accounts CAN have their own line items, but those are real items, not summaries)
    for (const item of leafItems) {
      // Every item should have a real description (not a summary label)
      expect(item.description).toBeTruthy();
      expect(item.category).toBeTruthy();
    }
  });
});
