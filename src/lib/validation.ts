/**
 * Validates that a comment body is non-empty and contains at least one
 * non-whitespace character.
 *
 * Returns `true` when the body is acceptable for submission, `false` otherwise.
 */
export function isValidCommentBody(body: string): boolean {
  return typeof body === 'string' && body.trim().length > 0;
}
