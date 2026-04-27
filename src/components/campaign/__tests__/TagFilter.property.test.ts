import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { arbJourney, arbJourneyType, JOURNEY_TYPES } from '../../../test/generators';
import type { Journey, JourneyType } from '../../../models/campaign';

/**
 * Pure logic: given journeys and selected tags, return filtered journeys.
 * This mirrors the filtering logic used in CampaignDetailPage and JourneysPage.
 */
function filterJourneysByTags(journeys: Journey[], selectedTags: string[]): Journey[] {
  if (selectedTags.length === 0) return journeys;
  return journeys.filter((j) => selectedTags.includes(j.type));
}

/** Extract distinct journey types from a list of journeys. */
function getDistinctTypes(journeys: Journey[]): string[] {
  return [...new Set(journeys.map((j) => j.type))];
}

describe('Property 8: Tag filter shows distinct types and filters correctly', () => {
  /**
   * **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
   */

  it('when no tags are selected, all journeys are visible', () => {
    fc.assert(
      fc.property(
        fc.array(arbJourney(), { minLength: 0, maxLength: 20 }),
        (journeys) => {
          const result = filterJourneysByTags(journeys, []);
          expect(result).toEqual(journeys);
        },
      ),
      { numRuns: 150 },
    );
  });

  it('filtered journeys are exactly those whose type is in the selected set', () => {
    fc.assert(
      fc.property(
        fc.array(arbJourney(), { minLength: 1, maxLength: 20 }),
        fc.uniqueArray(arbJourneyType(), { minLength: 1, maxLength: 4 }),
        (journeys, selectedTags) => {
          const result = filterJourneysByTags(journeys, selectedTags);
          const expected = journeys.filter((j) => selectedTags.includes(j.type));
          expect(result).toEqual(expected);
          // Every result has a type in the selected set
          for (const j of result) {
            expect(selectedTags).toContain(j.type);
          }
        },
      ),
      { numRuns: 150 },
    );
  });

  it('selecting all types returns all journeys', () => {
    fc.assert(
      fc.property(
        fc.array(arbJourney(), { minLength: 0, maxLength: 20 }),
        (journeys) => {
          const allTypes: JourneyType[] = [...JOURNEY_TYPES];
          const result = filterJourneysByTags(journeys, allTypes);
          expect(result).toEqual(journeys);
        },
      ),
      { numRuns: 150 },
    );
  });

  it('distinct types are derived from journey type values with no duplicates', () => {
    fc.assert(
      fc.property(
        fc.array(arbJourney(), { minLength: 0, maxLength: 20 }),
        (journeys) => {
          const types = getDistinctTypes(journeys);
          // No duplicates
          expect(types.length).toBe(new Set(types).size);
          // Every type is a valid JourneyType
          for (const t of types) {
            expect(JOURNEY_TYPES).toContain(t);
          }
          // Every journey's type is represented
          for (const j of journeys) {
            expect(types).toContain(j.type);
          }
        },
      ),
      { numRuns: 150 },
    );
  });

  it('filtering preserves journey order', () => {
    fc.assert(
      fc.property(
        fc.array(arbJourney(), { minLength: 1, maxLength: 20 }),
        fc.uniqueArray(arbJourneyType(), { minLength: 1, maxLength: 4 }),
        (journeys, selectedTags) => {
          const result = filterJourneysByTags(journeys, selectedTags);
          // Result should be a subsequence of the original array
          let lastIndex = -1;
          for (const j of result) {
            const idx = journeys.indexOf(j);
            expect(idx).toBeGreaterThan(lastIndex);
            lastIndex = idx;
          }
        },
      ),
      { numRuns: 150 },
    );
  });
});
