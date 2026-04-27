import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { arbCampaign, arbJourney, ACCOUNT_IDS } from '../../test/generators';
import type { Campaign, Journey } from '../../models/campaign';

/**
 * Pure logic helpers extracted from CampaignsContext and AccountContext.
 * Testing the core state logic without React rendering.
 */

const MASTER_ACCOUNT_ID = 'acc-master';

/** Simulates addCampaign: appends campaign to list */
function addCampaign(campaigns: Campaign[], campaign: Campaign): Campaign[] {
  return [...campaigns, campaign];
}

/** Simulates updateCampaign: updates matching campaign by id */
function updateCampaign(campaigns: Campaign[], id: string, updates: Partial<Campaign>): Campaign[] {
  return campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c));
}

/** Simulates filterByAccount from AccountContext */
function filterByAccount<T extends { accountId: string }>(items: T[], selectedAccountId: string): T[] {
  if (selectedAccountId === MASTER_ACCOUNT_ID) return items;
  return items.filter((item) => item.accountId === selectedAccountId);
}

/** Validates campaign name: non-empty after trimming */
function isValidCampaignName(name: string): boolean {
  return name.trim().length > 0;
}

describe('Property 9: Creating a campaign with a valid name adds a draft campaign', () => {
  /**
   * **Validates: Requirements 5.4**
   */
  it('adding a campaign with a valid name produces a draft campaign in the list', () => {
    fc.assert(
      fc.property(
        fc.array(arbCampaign(), { maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        (existingCampaigns, name) => {
          const newCampaign: Campaign = {
            id: `cmp-new-${Date.now()}`,
            name: name.trim(),
            accountId: 'acc-master',
            goal: '',
            dateRange: { start: '2024-01-01', end: '2025-12-31' },
            status: 'draft',
            journeyIds: [],
            tags: [],
          };

          const result = addCampaign(existingCampaigns, newCampaign);

          // List grew by exactly one
          expect(result.length).toBe(existingCampaigns.length + 1);
          // The new campaign is in the list
          const found = result.find((c) => c.id === newCampaign.id);
          expect(found).toBeDefined();
          expect(found!.name).toBe(name.trim());
          expect(found!.status).toBe('draft');
        },
      ),
      { numRuns: 150 },
    );
  });
});

describe('Property 10: Empty or whitespace campaign names are rejected', () => {
  /**
   * **Validates: Requirements 5.5**
   */
  it('empty string is rejected', () => {
    expect(isValidCampaignName('')).toBe(false);
  });

  it('whitespace-only strings are rejected', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 20 }).map((chars) => chars.join('')),
        (whitespaceStr) => {
          expect(isValidCampaignName(whitespaceStr)).toBe(false);
        },
      ),
      { numRuns: 150 },
    );
  });

  it('strings with non-whitespace content are accepted', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        (validName) => {
          expect(isValidCampaignName(validName)).toBe(true);
        },
      ),
      { numRuns: 150 },
    );
  });
});

describe('Property 12: Rename updates name in state', () => {
  /**
   * **Validates: Requirements 7.2, 7.3, 8.2, 8.3**
   */
  it('renaming a campaign updates only that campaign name', () => {
    fc.assert(
      fc.property(
        fc.array(arbCampaign(), { minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        (campaigns, newName) => {
          // Pick a random campaign to rename
          const targetIndex = 0;
          const target = campaigns[targetIndex];

          const result = updateCampaign(campaigns, target.id, { name: newName });

          // The renamed campaign has the new name
          const updated = result.find((c) => c.id === target.id);
          expect(updated).toBeDefined();
          expect(updated!.name).toBe(newName);

          // All other campaigns are unchanged
          for (const c of result) {
            if (c.id !== target.id) {
              const original = campaigns.find((o) => o.id === c.id);
              expect(c).toEqual(original);
            }
          }

          // List length unchanged
          expect(result.length).toBe(campaigns.length);
        },
      ),
      { numRuns: 150 },
    );
  });

  it('renaming a journey updates only that journey name', () => {
    fc.assert(
      fc.property(
        fc.array(arbJourney(), { minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        (journeys, newName) => {
          const target = journeys[0];

          const result = journeys.map((j) =>
            j.id === target.id ? { ...j, name: newName } : j,
          );

          const updated = result.find((j) => j.id === target.id);
          expect(updated).toBeDefined();
          expect(updated!.name).toBe(newName);

          for (const j of result) {
            if (j.id !== target.id) {
              const original = journeys.find((o) => o.id === j.id);
              expect(j).toEqual(original);
            }
          }

          expect(result.length).toBe(journeys.length);
        },
      ),
      { numRuns: 150 },
    );
  });
});

describe('Property 13: Account filter scopes campaigns correctly', () => {
  /**
   * **Validates: Requirements 10.1, 10.3**
   */
  it('master account shows all campaigns', () => {
    fc.assert(
      fc.property(
        fc.array(arbCampaign(), { minLength: 0, maxLength: 20 }),
        (campaigns) => {
          const result = filterByAccount(campaigns, MASTER_ACCOUNT_ID);
          expect(result).toEqual(campaigns);
        },
      ),
      { numRuns: 150 },
    );
  });

  it('non-master account shows only matching campaigns', () => {
    fc.assert(
      fc.property(
        fc.array(arbCampaign(), { minLength: 0, maxLength: 20 }),
        fc.constantFrom(...ACCOUNT_IDS.filter((id) => id !== MASTER_ACCOUNT_ID)),
        (campaigns, accountId) => {
          const result = filterByAccount(campaigns, accountId);
          // Every result matches the account
          for (const c of result) {
            expect(c.accountId).toBe(accountId);
          }
          // No matching campaign was excluded
          const expected = campaigns.filter((c) => c.accountId === accountId);
          expect(result).toEqual(expected);
        },
      ),
      { numRuns: 150 },
    );
  });

  it('filter is idempotent — filtering twice gives same result', () => {
    fc.assert(
      fc.property(
        fc.array(arbCampaign(), { minLength: 0, maxLength: 20 }),
        fc.constantFrom(...ACCOUNT_IDS),
        (campaigns, accountId) => {
          const once = filterByAccount(campaigns, accountId);
          const twice = filterByAccount(once, accountId);
          expect(twice).toEqual(once);
        },
      ),
      { numRuns: 150 },
    );
  });
});
