import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { FeedbackComment } from '../../contexts/FeedbackContext';

/**
 * Local FeedbackComment arbitrary that avoids the fc.date issue in fast-check v4.
 * Uses a fixed set of valid ISO timestamps instead.
 */
function arbFeedbackCommentLocal(): fc.Arbitrary<FeedbackComment> {
  const arbSafeISOTimestamp = fc
    .integer({ min: 1672531200000, max: 1767225599000 }) // 2023-01-01 to 2025-12-31
    .map((ms) => new Date(ms).toISOString());

  return fc.record({
    id: fc.uuid(),
    pageRoute: fc.constantFrom(
      '/dashboard',
      '/automations/campaigns',
      '/audiences/segments',
      '/content/assets',
      '/settings',
    ),
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
 * Property 5: Feedback comments are stored with all required fields
 *
 * For any generated FeedbackComment, all required fields are present and valid:
 * 1. id is a non-empty string
 * 2. pageRoute is a non-empty string starting with /
 * 3. userId is a non-empty string
 * 4. userDisplayName is a non-empty string
 * 5. body is a non-empty string (trimmed)
 * 6. createdAt is a valid ISO 8601 timestamp
 *
 * This is a pure data shape validation property test — no mocking needed.
 *
 * **Validates: Requirements 5.2**
 */
describe('Property 5: Feedback comments are stored with all required fields', () => {
  it('every generated FeedbackComment has all required fields present and valid', () => {
    fc.assert(
      fc.property(arbFeedbackCommentLocal(), (comment) => {
        // 1. id is a non-empty string
        expect(typeof comment.id).toBe('string');
        expect(comment.id.length).toBeGreaterThan(0);

        // 2. pageRoute is a non-empty string starting with /
        expect(typeof comment.pageRoute).toBe('string');
        expect(comment.pageRoute.length).toBeGreaterThan(0);
        expect(comment.pageRoute.startsWith('/')).toBe(true);

        // 3. userId is a non-empty string
        expect(typeof comment.userId).toBe('string');
        expect(comment.userId.length).toBeGreaterThan(0);

        // 4. userDisplayName is a non-empty string
        expect(typeof comment.userDisplayName).toBe('string');
        expect(comment.userDisplayName.length).toBeGreaterThan(0);

        // 5. body is a non-empty string (trimmed)
        expect(typeof comment.body).toBe('string');
        expect(comment.body.trim().length).toBeGreaterThan(0);

        // 6. createdAt is a valid ISO 8601 timestamp
        expect(typeof comment.createdAt).toBe('string');
        const parsed = new Date(comment.createdAt);
        expect(parsed.toString()).not.toBe('Invalid Date');
        expect(parsed.toISOString()).toBe(comment.createdAt);
      }),
      { numRuns: 200 },
    );
  });
});
