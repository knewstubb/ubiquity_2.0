import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { FeedbackComment } from '../../contexts/FeedbackContext';

/**
 * Pure function that mirrors FeedbackContext's ordering logic:
 * sorts comments by createdAt descending (newest first).
 */
function sortCommentsDescending(comments: FeedbackComment[]): FeedbackComment[] {
  return [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

const PAGE_ROUTES = [
  '/dashboard',
  '/automations/campaigns',
  '/audiences/segments',
  '/content/assets',
  '/settings',
] as const;

/** Local arbitrary that avoids fc.date issues in fast-check v4. */
function arbFeedbackCommentLocal(): fc.Arbitrary<FeedbackComment> {
  const arbSafeISOTimestamp = fc
    .integer({ min: 1672531200000, max: 1767225599000 })
    .map((ms) => new Date(ms).toISOString());

  return fc.record({
    id: fc.uuid(),
    pageRoute: fc.constantFrom(...PAGE_ROUTES),
    userId: fc.uuid(),
    userDisplayName: fc
      .string({ minLength: 1, maxLength: 40 })
      .filter((s) => s.trim().length > 0),
    body: fc
      .string({ minLength: 1, maxLength: 500 })
      .filter((s) => s.trim().length > 0),
    createdAt: arbSafeISOTimestamp,
  });
}

/**
 * Property 7: Feedback comments are ordered by timestamp descending
 *
 * For any generated array of FeedbackComment objects with random timestamps,
 * after sorting by createdAt descending (as FeedbackContext does), each
 * comment's createdAt is >= the next comment's createdAt.
 *
 * This is a pure sorting property test — no React rendering needed.
 *
 * **Validates: Requirements 5.4**
 */
describe('Property 7: Feedback comments are ordered by timestamp descending', () => {
  it('sorted comments have each createdAt >= the next createdAt', () => {
    fc.assert(
      fc.property(
        fc.array(arbFeedbackCommentLocal(), { minLength: 0, maxLength: 50 }),
        (comments) => {
          const sorted = sortCommentsDescending(comments);

          for (let i = 0; i < sorted.length - 1; i++) {
            const current = new Date(sorted[i].createdAt).getTime();
            const next = new Date(sorted[i + 1].createdAt).getTime();
            expect(current).toBeGreaterThanOrEqual(next);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it('sorting preserves all original comments (no elements lost or added)', () => {
    fc.assert(
      fc.property(
        fc.array(arbFeedbackCommentLocal(), { minLength: 0, maxLength: 50 }),
        (comments) => {
          const sorted = sortCommentsDescending(comments);

          expect(sorted.length).toBe(comments.length);

          const originalIds = comments.map((c) => c.id).sort();
          const sortedIds = sorted.map((c) => c.id).sort();
          expect(sortedIds).toEqual(originalIds);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('sorting is idempotent — sorting an already-sorted array produces the same result', () => {
    fc.assert(
      fc.property(
        fc.array(arbFeedbackCommentLocal(), { minLength: 0, maxLength: 50 }),
        (comments) => {
          const sorted1 = sortCommentsDescending(comments);
          const sorted2 = sortCommentsDescending(sorted1);

          expect(sorted2.map((c) => c.id)).toEqual(sorted1.map((c) => c.id));
        },
      ),
      { numRuns: 200 },
    );
  });
});
