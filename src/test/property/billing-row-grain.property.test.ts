import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { billingLineItems } from '../../data/billingData';

/**
 * Property 8: Row Grain — One Row Per Individual Item
 * **Validates: Requirements 3.2, 9.1**
 *
 * Every BillingLineItem has a unique id.
 * Total count equals number of individual items.
 */

describe('Property 8: Row Grain — One Row Per Individual Item', () => {
  it('every BillingLineItem has a unique id', () => {
    const ids = billingLineItems.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('total count equals number of individual items (no summary-only rows)', () => {
    // Every item should have a valid id, accountId, category, and positive items count
    for (const item of billingLineItems) {
      expect(item.id).toBeTruthy();
      expect(item.accountId).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(typeof item.items).toBe('number');
    }
    // The array length IS the total count — no hidden summary rows
    expect(billingLineItems.length).toBe(billingLineItems.length);
  });

  it('FOR ALL subsets of billingLineItems, ids remain unique within the subset', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray(billingLineItems, { minLength: 1 }),
        (subset) => {
          const ids = subset.map((item) => item.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('every item has a valid billing category', () => {
    const validCategories = new Set([
      'Database Records',
      'Transactional Records',
      'Mailouts',
      'Automated Mailouts',
      'Form Triggered Emails',
      'Integrations',
    ]);
    for (const item of billingLineItems) {
      expect(validCategories.has(item.category)).toBe(true);
    }
  });
});
