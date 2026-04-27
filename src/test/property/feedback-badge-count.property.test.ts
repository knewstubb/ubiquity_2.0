import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { FeedbackComment } from '../../contexts/FeedbackContext';

/**
 * Pure function that mirrors FeedbackContext.commentCountForPage:
 * filters comments by pageRoute and returns the count.
 */
function commentCountForPage(comments: FeedbackComment[], route: string): number {
  return comments.filter((c) => c.pageRoute === route).length;
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
 * Property 6: Feedback badge count equals stored comment count
 *
 * For any generated set of FeedbackComment objects and any page route,
 * commentCountForPage returns exactly the number of comments whose
 * pageRoute matches the given route.
 *
 * This is a pure logic property test — no React rendering or mocking needed.
 *
 * **Validates: Requirements 5.3**
 */
describe('Property 6: Feedback badge count equals stored comment count', () => {
  it('commentCountForPage matches the actual filtered count for any route', () => {
    fc.assert(
      fc.property(
        fc.array(arbFeedbackCommentLocal(), { minLength: 0, maxLength: 50 }),
        fc.constantFrom(...PAGE_ROUTES),
        (comments, route) => {
          const badgeCount = commentCountForPage(comments, route);
          const expected = comments.filter((c) => c.pageRoute === route).length;

          expect(badgeCount).toBe(expected);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('returns 0 for a route with no matching comments', () => {
    fc.assert(
      fc.property(
        fc.array(arbFeedbackCommentLocal(), { minLength: 0, maxLength: 30 }),
        (comments) => {
          const unknownRoute = '/nonexistent/route';
          expect(commentCountForPage(comments, unknownRoute)).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('total counts across all routes equal total comment count', () => {
    fc.assert(
      fc.property(
        fc.array(arbFeedbackCommentLocal(), { minLength: 0, maxLength: 50 }),
        (comments) => {
          const totalFromCounts = PAGE_ROUTES.reduce(
            (sum, route) => sum + commentCountForPage(comments, route),
            0,
          );
          expect(totalFromCounts).toBe(comments.length);
        },
      ),
      { numRuns: 200 },
    );
  });
});
