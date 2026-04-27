import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { computeUnseenEntries } from '../../lib/changelog-utils';
import type { ChangelogEntry } from '../../contexts/ChangelogContext';

/**
 * Local ChangelogEntry arbitrary that avoids the fc.date issue in fast-check v4.
 * Uses integer-based timestamps instead of fc.date().map(d => d.toISOString()).
 */
const ROUTES = ['/dashboard', '/automations/campaigns', '/audiences/segments', '/content/assets', '/settings'];

function arbSafeTimestamp(): fc.Arbitrary<string> {
  // Generate a timestamp from integer components to avoid Invalid Date during shrinking
  return fc
    .record({
      year: fc.integer({ min: 2023, max: 2025 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 }),
      hour: fc.integer({ min: 0, max: 23 }),
      minute: fc.integer({ min: 0, max: 59 }),
      second: fc.integer({ min: 0, max: 59 }),
    })
    .map(({ year, month, day, hour, minute, second }) => {
      const m = String(month).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      const h = String(hour).padStart(2, '0');
      const min = String(minute).padStart(2, '0');
      const s = String(second).padStart(2, '0');
      return `${year}-${m}-${d}T${h}:${min}:${s}.000Z`;
    });
}

function arbLocalChangelogEntry(): fc.Arbitrary<ChangelogEntry> {
  return fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0),
    description: fc.string({ maxLength: 300 }),
    affectedRoutes: fc.array(fc.constantFrom(...ROUTES), { maxLength: 4 }),
    createdAt: arbSafeTimestamp(),
  });
}

/**
 * Property 11: Unseen changelog entries trigger banner
 *
 * For any authenticated user whose last_seen_entry_id is older than the most
 * recent changelog entry (or has no record in user_changelog_seen), the changelog
 * banner should be visible and list all entries newer than their last seen entry.
 *
 * **Validates: Requirements 8.2**
 */
describe('Property 11: Unseen changelog entries trigger banner', () => {
  /** Sort entries by createdAt descending, as the context does */
  function sortDesc(entries: ChangelogEntry[]): ChangelogEntry[] {
    return [...entries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  it('if lastSeenEntryId is null, all entries are unseen and banner is shown', () => {
    fc.assert(
      fc.property(
        fc.array(arbLocalChangelogEntry(), { minLength: 1, maxLength: 20 }),
        (rawEntries) => {
          const entries = sortDesc(rawEntries);
          const { unseenEntries, showBanner } = computeUnseenEntries(entries, null);

          expect(showBanner).toBe(true);
          expect(unseenEntries).toEqual(entries);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('if lastSeenEntryId is undefined, all entries are unseen and banner is shown', () => {
    fc.assert(
      fc.property(
        fc.array(arbLocalChangelogEntry(), { minLength: 1, maxLength: 20 }),
        (rawEntries) => {
          const entries = sortDesc(rawEntries);
          const { unseenEntries, showBanner } = computeUnseenEntries(entries, undefined);

          expect(showBanner).toBe(true);
          expect(unseenEntries).toEqual(entries);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('if lastSeenEntryId matches the first (newest) entry, showBanner is false and no unseen entries', () => {
    fc.assert(
      fc.property(
        fc.array(arbLocalChangelogEntry(), { minLength: 1, maxLength: 20 }),
        (rawEntries) => {
          const entries = sortDesc(rawEntries);
          const lastSeenEntryId = entries[0].id;
          const { unseenEntries, showBanner } = computeUnseenEntries(entries, lastSeenEntryId);

          expect(showBanner).toBe(false);
          expect(unseenEntries).toHaveLength(0);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('if lastSeenEntryId matches an entry in the middle, unseen entries are those before it', () => {
    fc.assert(
      fc.property(
        // Need at least 2 entries to have a "middle" entry
        fc.array(arbLocalChangelogEntry(), { minLength: 2, maxLength: 20 }),
        fc.nat(),
        (rawEntries, indexSeed) => {
          const entries = sortDesc(rawEntries);
          // Pick an index from 1..length-1 (not the first, so there are unseen entries)
          const seenIndex = 1 + (indexSeed % (entries.length - 1));
          const lastSeenEntryId = entries[seenIndex].id;

          const { unseenEntries, showBanner } = computeUnseenEntries(entries, lastSeenEntryId);

          expect(showBanner).toBe(true);
          expect(unseenEntries).toHaveLength(seenIndex);
          expect(unseenEntries).toEqual(entries.slice(0, seenIndex));
        },
      ),
      { numRuns: 200 },
    );
  });

  it('if lastSeenEntryId does not match any entry, all entries are unseen', () => {
    fc.assert(
      fc.property(
        fc.array(arbLocalChangelogEntry(), { minLength: 1, maxLength: 20 }),
        fc.uuid(),
        (rawEntries, unknownId) => {
          const entries = sortDesc(rawEntries);
          // Ensure the unknownId doesn't accidentally match any entry
          const safeId = entries.some((e) => e.id === unknownId)
            ? `nonexistent-${unknownId}`
            : unknownId;

          const { unseenEntries, showBanner } = computeUnseenEntries(entries, safeId);

          expect(showBanner).toBe(true);
          expect(unseenEntries).toEqual(entries);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('empty entries list always results in no banner regardless of lastSeenEntryId', () => {
    fc.assert(
      fc.property(
        fc.option(fc.uuid(), { nil: null }),
        (lastSeenEntryId) => {
          const { unseenEntries, showBanner } = computeUnseenEntries([], lastSeenEntryId);

          expect(showBanner).toBe(false);
          expect(unseenEntries).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});
