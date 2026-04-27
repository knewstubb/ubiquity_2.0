import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { saveSession, loadSession, clearSession } from '../../lib/session-store';
import type { SessionState, SimulatedRole } from '../../lib/session-store';
import type { FilterGroup, FilterRule } from '../../models/segment';

/**
 * Local SessionState arbitrary that avoids the fc.date issue in fast-check v4.
 * Mirrors arbSessionState from generators.ts but uses safe primitives.
 */

const ACCOUNT_IDS = ['acc-master', 'acc-auckland', 'acc-wellington', 'acc-christchurch', 'acc-queenstown'];
const SIMULATED_ROLES: SimulatedRole[] = ['admin', 'marketer', 'viewer'];
const ROUTES = ['/dashboard', '/automations/campaigns', '/audiences/segments', '/content/assets', '/settings'];
const PANELS = ['feedback', 'inspector', 'whats-new', 'settings'];

function arbFilterRule(): fc.Arbitrary<FilterRule> {
  return fc.record({
    field: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    operator: fc.constantFrom('equals', 'contains', 'greaterThan', 'lessThan'),
    value: fc.string({ minLength: 1, maxLength: 30 }),
  });
}

function arbFilterGroup(): fc.Arbitrary<FilterGroup> {
  return fc.record({
    combinator: fc.constantFrom('AND' as const, 'OR' as const),
    rules: fc.array(arbFilterRule(), { maxLength: 3 }),
    groups: fc.constant([] as FilterGroup[]),
  });
}

function arbSessionStateLocal(): fc.Arbitrary<SessionState> {
  return fc.record({
    selectedAccountId: fc.constantFrom(...ACCOUNT_IDS),
    activeFilters: fc.record({
      segmentFilters: fc.option(arbFilterGroup(), { nil: undefined }),
      campaignTags: fc.option(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 3 }),
        { nil: undefined },
      ),
      assetTypeFilter: fc.option(
        fc.constantFrom('image', 'colour', 'font', 'footer'),
        { nil: undefined },
      ),
    }),
    openPanels: fc.array(fc.constantFrom(...PANELS), { maxLength: 3 }),
    simulatedRole: fc.constantFrom(...SIMULATED_ROLES),
    lastRoute: fc.constantFrom(...ROUTES),
  });
}

/**
 * Property 9: Session state round-trip with partial merge
 *
 * For any valid SessionState object and any user ID:
 * 1. Full round-trip: saveSession then loadSession returns equivalent state
 * 2. Partial merge: save full state, then save partial update, load should have
 *    updated keys + preserved original keys
 *
 * **Validates: Requirements 6.1, 6.2, 7.3**
 */
describe('Property 9: Session state round-trip with partial merge', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('full round-trip: saveSession then loadSession returns equivalent state', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        arbSessionStateLocal(),
        (userId, state) => {
          clearSession(userId);

          saveSession(userId, state);
          const loaded = loadSession(userId);

          expect(loaded).not.toBeNull();
          expect(loaded).toEqual(state);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('partial merge: saving partial update preserves unrelated keys from original state', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        arbSessionStateLocal(),
        fc.constantFrom(...SIMULATED_ROLES),
        fc.constantFrom(...ROUTES),
        (userId, originalState, newRole, newRoute) => {
          clearSession(userId);

          // Save full original state
          saveSession(userId, originalState);

          // Save partial update (only simulatedRole and lastRoute)
          saveSession(userId, {
            simulatedRole: newRole,
            lastRoute: newRoute,
          });

          const loaded = loadSession(userId);

          expect(loaded).not.toBeNull();

          // Updated keys should reflect the partial update
          expect(loaded!.simulatedRole).toBe(newRole);
          expect(loaded!.lastRoute).toBe(newRoute);

          // Unrelated keys should be preserved from the original state
          expect(loaded!.selectedAccountId).toBe(originalState.selectedAccountId);
          expect(loaded!.activeFilters).toEqual(originalState.activeFilters);
          expect(loaded!.openPanels).toEqual(originalState.openPanels);
        },
      ),
      { numRuns: 200 },
    );
  });
});
