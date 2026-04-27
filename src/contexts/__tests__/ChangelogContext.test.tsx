import { render, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Hoisted mock state (runs before any imports) ---
const { mockState, mockFrom, mockChain, mockUser } = vi.hoisted(() => {
  const state = {
    configured: true,
    entriesFetchResult: null as { data: unknown[] | null; error: unknown } | null,
    seenFetchResult: null as { data: unknown | null; error: unknown } | null,
    upsertResult: null as { error: unknown } | null,
  };

  const user = {
    current: null as { id: string; email: string; displayName: string; avatarInitials: string } | null,
  };

  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    upsert: vi.fn(),
  };

  // Default chaining
  chain.select.mockImplementation(() => chain);
  chain.eq.mockImplementation(() => chain);
  chain.upsert.mockImplementation(() =>
    Promise.resolve(state.upsertResult ?? { error: null }),
  );

  // order() resolves the entries fetch
  chain.order.mockImplementation(() =>
    Promise.resolve(state.entriesFetchResult ?? { data: [], error: null }),
  );

  // single() resolves the seen fetch
  chain.single.mockImplementation(() =>
    Promise.resolve(state.seenFetchResult ?? { data: null, error: null }),
  );

  const from = vi.fn().mockReturnValue(chain);

  return { mockState: state, mockFrom: from, mockChain: chain, mockUser: user };
});

vi.mock('../../lib/supabase', () => ({
  get supabase() {
    return mockState.configured ? { from: mockFrom } : null;
  },
  isSupabaseConfigured: () => mockState.configured,
}));

vi.mock('../AuthContext', () => ({
  useAuth: () => ({ user: mockUser.current, isLoading: false, signIn: vi.fn(), signOut: vi.fn() }),
}));

import { ChangelogProvider, useChangelog } from '../ChangelogContext';
import type { ChangelogContextValue } from '../ChangelogContext';

// Helper to capture context value
let ctx: ChangelogContextValue | null = null;
function CtxCapture() {
  ctx = useChangelog();
  return null;
}

const fakeUser = {
  id: 'user-1',
  email: 'alice@example.com',
  displayName: 'Alice',
  avatarInitials: 'AL',
};

const sampleEntries = [
  {
    id: 'entry-3',
    title: 'New dashboard',
    description: 'Redesigned dashboard',
    affected_routes: ['/dashboard'],
    created_at: '2024-06-17T10:00:00Z',
  },
  {
    id: 'entry-2',
    title: 'Campaign builder',
    description: 'Added campaign builder',
    affected_routes: ['/automations/campaigns'],
    created_at: '2024-06-16T10:00:00Z',
  },
  {
    id: 'entry-1',
    title: 'Initial release',
    description: 'First version',
    affected_routes: [],
    created_at: '2024-06-15T10:00:00Z',
  },
];

function resetMocks() {
  mockState.configured = true;
  mockState.entriesFetchResult = null;
  mockState.seenFetchResult = null;
  mockState.upsertResult = null;
  mockUser.current = fakeUser;
  ctx = null;
  vi.clearAllMocks();

  // Re-wire chaining after clearAllMocks
  mockChain.select.mockImplementation(() => mockChain);
  mockChain.eq.mockImplementation(() => mockChain);
  mockChain.upsert.mockImplementation(() =>
    Promise.resolve(mockState.upsertResult ?? { error: null }),
  );
  mockChain.order.mockImplementation(() =>
    Promise.resolve(mockState.entriesFetchResult ?? { data: [], error: null }),
  );
  mockChain.single.mockImplementation(() =>
    Promise.resolve(mockState.seenFetchResult ?? { data: null, error: null }),
  );
  mockFrom.mockReturnValue(mockChain);
}

function renderProvider() {
  return render(
    <ChangelogProvider>
      <CtxCapture />
    </ChangelogProvider>,
  );
}

describe('ChangelogContext', () => {
  beforeEach(() => resetMocks());

  describe('Fetches entries from Supabase on mount (Req 8.2)', () => {
    it('fetches changelog entries ordered by created_at descending', async () => {
      mockState.entriesFetchResult = { data: sampleEntries, error: null };
      mockState.seenFetchResult = { data: null, error: { code: 'PGRST116', message: 'not found' } };

      renderProvider();
      await waitFor(() => expect(ctx!.entries).toHaveLength(3));

      expect(mockFrom).toHaveBeenCalledWith('changelog_entries');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('maps Supabase rows to ChangelogEntry shape', async () => {
      mockState.entriesFetchResult = { data: [sampleEntries[0]], error: null };
      mockState.seenFetchResult = { data: null, error: { code: 'PGRST116', message: 'not found' } };

      renderProvider();
      await waitFor(() => expect(ctx!.entries).toHaveLength(1));

      expect(ctx!.entries[0]).toEqual({
        id: 'entry-3',
        title: 'New dashboard',
        description: 'Redesigned dashboard',
        affectedRoutes: ['/dashboard'],
        createdAt: '2024-06-17T10:00:00Z',
      });
    });
  });

  describe('showBanner is true when unseen entries exist (Req 8.2)', () => {
    it('showBanner is true when no last_seen_entry_id exists (all entries unseen)', async () => {
      mockState.entriesFetchResult = { data: sampleEntries, error: null };
      mockState.seenFetchResult = { data: null, error: { code: 'PGRST116', message: 'not found' } };

      renderProvider();
      await waitFor(() => expect(ctx!.entries).toHaveLength(3));

      expect(ctx!.showBanner).toBe(true);
      expect(ctx!.unseenEntries).toHaveLength(3);
    });

    it('showBanner is true when some entries are newer than last seen', async () => {
      mockState.entriesFetchResult = { data: sampleEntries, error: null };
      // User has seen entry-2, so entry-3 is unseen
      mockState.seenFetchResult = { data: { last_seen_entry_id: 'entry-2' }, error: null };

      renderProvider();
      await waitFor(() => expect(ctx!.entries).toHaveLength(3));

      expect(ctx!.showBanner).toBe(true);
      expect(ctx!.unseenEntries).toHaveLength(1);
      expect(ctx!.unseenEntries[0].id).toBe('entry-3');
    });
  });

  describe('showBanner is false when all entries have been seen (Req 8.3)', () => {
    it('showBanner is false when last_seen_entry_id matches the latest entry', async () => {
      mockState.entriesFetchResult = { data: sampleEntries, error: null };
      // User has seen the latest entry
      mockState.seenFetchResult = { data: { last_seen_entry_id: 'entry-3' }, error: null };

      renderProvider();
      await waitFor(() => expect(ctx!.entries).toHaveLength(3));

      expect(ctx!.showBanner).toBe(false);
      expect(ctx!.unseenEntries).toHaveLength(0);
    });

    it('showBanner is false when there are no entries', async () => {
      mockState.entriesFetchResult = { data: [], error: null };
      mockState.seenFetchResult = { data: null, error: { code: 'PGRST116', message: 'not found' } };

      renderProvider();
      await waitFor(() => expect(ctx).not.toBeNull());

      // Give effect time to complete
      await act(async () => {});

      expect(ctx!.showBanner).toBe(false);
      expect(ctx!.unseenEntries).toHaveLength(0);
    });
  });

  describe('unseenEntries contains only entries newer than last_seen_entry_id (Req 8.2)', () => {
    it('returns all entries when last_seen_entry_id is not found in entries list', async () => {
      mockState.entriesFetchResult = { data: sampleEntries, error: null };
      // last_seen_entry_id references a deleted/unknown entry
      mockState.seenFetchResult = { data: { last_seen_entry_id: 'deleted-entry' }, error: null };

      renderProvider();
      await waitFor(() => expect(ctx!.entries).toHaveLength(3));

      // All treated as unseen when last seen entry not found
      expect(ctx!.unseenEntries).toHaveLength(3);
    });

    it('returns entries before the seen index (sorted DESC)', async () => {
      mockState.entriesFetchResult = { data: sampleEntries, error: null };
      // User has seen entry-1 (oldest), so entry-3 and entry-2 are unseen
      mockState.seenFetchResult = { data: { last_seen_entry_id: 'entry-1' }, error: null };

      renderProvider();
      await waitFor(() => expect(ctx!.entries).toHaveLength(3));

      expect(ctx!.unseenEntries).toHaveLength(2);
      expect(ctx!.unseenEntries[0].id).toBe('entry-3');
      expect(ctx!.unseenEntries[1].id).toBe('entry-2');
    });
  });

  describe('dismissBanner sets showBanner to false and updates last_seen_entry_id (Req 8.3)', () => {
    it('sets showBanner to false after dismiss', async () => {
      mockState.entriesFetchResult = { data: sampleEntries, error: null };
      mockState.seenFetchResult = { data: null, error: { code: 'PGRST116', message: 'not found' } };

      renderProvider();
      await waitFor(() => expect(ctx!.showBanner).toBe(true));

      await act(async () => {
        ctx!.dismissBanner();
      });

      expect(ctx!.showBanner).toBe(false);
      expect(ctx!.unseenEntries).toHaveLength(0);
    });

    it('upserts the latest entry id to user_changelog_seen', async () => {
      mockState.entriesFetchResult = { data: sampleEntries, error: null };
      mockState.seenFetchResult = { data: null, error: { code: 'PGRST116', message: 'not found' } };

      renderProvider();
      await waitFor(() => expect(ctx!.showBanner).toBe(true));

      await act(async () => {
        ctx!.dismissBanner();
      });

      expect(mockFrom).toHaveBeenCalledWith('user_changelog_seen');
      expect(mockChain.upsert).toHaveBeenCalledWith(
        { user_id: 'user-1', last_seen_entry_id: 'entry-3' },
        { onConflict: 'user_id' },
      );
    });
  });

  describe('Local mode provides no-op implementations', () => {
    it('returns NOOP_VALUE when Supabase is not configured', () => {
      mockState.configured = false;

      renderProvider();

      expect(ctx!.entries).toEqual([]);
      expect(ctx!.unseenEntries).toEqual([]);
      expect(ctx!.showBanner).toBe(false);
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('returns NOOP_VALUE when user is null', () => {
      mockUser.current = null;

      renderProvider();

      expect(ctx!.entries).toEqual([]);
      expect(ctx!.unseenEntries).toEqual([]);
      expect(ctx!.showBanner).toBe(false);
    });

    it('dismissBanner is a no-op in local mode', async () => {
      mockState.configured = false;

      renderProvider();

      // Should not throw
      ctx!.dismissBanner();
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  describe('useChangelog hook', () => {
    it('throws when used outside ChangelogProvider', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<CtxCapture />)).toThrow(
        'useChangelog must be used within a ChangelogProvider',
      );
      spy.mockRestore();
    });
  });
});
