import type { ChangelogEntry } from '../contexts/ChangelogContext';

/**
 * Pure function that computes unseen changelog entries and banner visibility.
 *
 * @param entries - Changelog entries sorted by createdAt descending (newest first)
 * @param lastSeenEntryId - The ID of the last entry the user has seen, or null/undefined if none
 * @returns Object with unseenEntries array and showBanner boolean
 */
export function computeUnseenEntries(
  entries: ChangelogEntry[],
  lastSeenEntryId: string | null | undefined,
): { unseenEntries: ChangelogEntry[]; showBanner: boolean } {
  if (entries.length === 0) {
    return { unseenEntries: [], showBanner: false };
  }

  if (!lastSeenEntryId) {
    // No record of last seen — all entries are unseen
    return { unseenEntries: entries, showBanner: true };
  }

  // Find the index of the last seen entry
  const seenIndex = entries.findIndex((e) => e.id === lastSeenEntryId);
  if (seenIndex === -1) {
    // Last seen entry not found — treat all as unseen
    return { unseenEntries: entries, showBanner: true };
  }

  // Entries before the seen index are unseen (since entries are sorted DESC)
  const unseen = entries.slice(0, seenIndex);
  return { unseenEntries: unseen, showBanner: unseen.length > 0 };
}
