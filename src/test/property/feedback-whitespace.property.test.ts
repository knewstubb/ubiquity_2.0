import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { isValidCommentBody } from '../../lib/validation';

/**
 * Property 8: Whitespace-only comments are rejected
 *
 * Generate whitespace-only strings, verify rejection without record creation.
 * Also verify that strings containing at least one non-whitespace character are accepted.
 *
 * **Validates: Requirements 5.5**
 */
describe('Property 8: Whitespace-only comments are rejected', () => {
  it('rejects any string composed entirely of whitespace characters', () => {
    const arbWhitespaceOnly = fc
      .array(fc.constantFrom(' ', '\t', '\n', '\r', '\f', '\v', '\u00A0', '\u2003'), {
        minLength: 0,
        maxLength: 50,
      })
      .map((chars) => chars.join(''));

    fc.assert(
      fc.property(arbWhitespaceOnly, (ws) => {
        expect(isValidCommentBody(ws)).toBe(false);
      }),
      { numRuns: 200 },
    );
  });

  it('accepts any string that contains at least one non-whitespace character', () => {
    const arbNonWhitespace = fc
      .string({ minLength: 1, maxLength: 200 })
      .filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(arbNonWhitespace, (body) => {
        expect(isValidCommentBody(body)).toBe(true);
      }),
      { numRuns: 200 },
    );
  });
});
