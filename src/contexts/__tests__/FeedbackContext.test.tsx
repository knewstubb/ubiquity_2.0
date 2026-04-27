import { render, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Hoisted mock state (runs before any imports) ---
const { mockState, mockFrom, mockChain, mockLocation, mockUser } = vi.hoisted(() => {
  const state = {
    configured: true,
    fetchResult: null as { data: unknown[] | null; error: unknown } | null,
    insertResult: null as { data: unknown | null; error: unknown } | null,
    deleteResult: null as { error: unknown } | null,
  };

  const user = {
    current: null as { id: string; email: string; displayName: string; avatarInitials: string } | null,
  };

  const location = { pathname: '/dashboard' };

  // Build a chainable mock for Supabase query builder
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    single: vi.fn(),
  };

  // Wire up chaining: each method returns the chain object
  chain.select.mockImplementation(() => chain);
  chain.eq.mockImplementation(() => chain);
  chain.insert.mockImplementation(() => chain);
  chain.delete.mockImplementation(() => chain);

  // order() resolves the fetch query
  chain.order.mockImplementation(() =>
    Promise.resolve(state.fetchResult ?? { data: [], error: null }),
  );

  // single() resolves the insert query
  chain.single.mockImplementation(() =>
    Promise.resolve(state.insertResult ?? { data: null, error: null }),
  );

  const from = vi.fn().mockReturnValue(chain);

  return { mockState: state, mockFrom: from, mockChain: chain, mockLocation: location, mockUser: user };
});

vi.mock('../../lib/supabase', () => ({
  get supabase() {
    return mockState.configured ? { from: mockFrom } : null;
  },
  isSupabaseConfigured: () => mockState.configured,
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => mockLocation,
}));

vi.mock('../AuthContext', () => ({
  useAuth: () => ({ user: mockUser.current, isLoading: false, signIn: vi.fn(), signOut: vi.fn() }),
}));

import { FeedbackProvider, useFeedback } from '../FeedbackContext';
import type { FeedbackContextValue } from '../FeedbackContext';

// Helper to capture context value
let ctx: FeedbackContextValue | null = null;
function CtxCapture() {
  ctx = useFeedback();
  return null;
}

const fakeUser = {
  id: 'user-1',
  email: 'alice@example.com',
  displayName: 'Alice',
  avatarInitials: 'AL',
};

const sampleRows = [
  {
    id: 'c1',
    page_route: '/dashboard',
    user_id: 'user-1',
    user_display_name: 'Alice',
    body: 'Looks great!',
    created_at: '2024-06-15T10:00:00Z',
  },
  {
    id: 'c2',
    page_route: '/dashboard',
    user_id: 'user-2',
    user_display_name: 'Bob',
    body: 'Needs work',
    created_at: '2024-06-14T09:00:00Z',
  },
];

function resetMocks() {
  mockState.configured = true;
  mockState.fetchResult = null;
  mockState.insertResult = null;
  mockState.deleteResult = null;
  mockLocation.pathname = '/dashboard';
  mockUser.current = fakeUser;
  ctx = null;
  vi.clearAllMocks();

  // Re-wire chaining after clearAllMocks
  mockChain.select.mockImplementation(() => mockChain);
  mockChain.eq.mockImplementation(() => mockChain);
  mockChain.insert.mockImplementation(() => mockChain);
  mockChain.delete.mockImplementation(() => mockChain);
  mockChain.order.mockImplementation(() =>
    Promise.resolve(mockState.fetchResult ?? { data: [], error: null }),
  );
  mockChain.single.mockImplementation(() =>
    Promise.resolve(mockState.insertResult ?? { data: null, error: null }),
  );
  mockFrom.mockReturnValue(mockChain);
}

function renderProvider() {
  return render(
    <FeedbackProvider>
      <CtxCapture />
    </FeedbackProvider>,
  );
}

describe('FeedbackContext', () => {
  beforeEach(() => resetMocks());

  describe('addComment stores comment with correct fields (Req 5.2)', () => {
    it('inserts comment with page_route, user_id, user_display_name, and trimmed body', async () => {
      mockState.fetchResult = { data: [], error: null };
      const insertedRow = {
        id: 'new-1',
        page_route: '/dashboard',
        user_id: 'user-1',
        user_display_name: 'Alice',
        body: 'Great feature',
        created_at: '2024-06-16T12:00:00Z',
      };
      mockState.insertResult = { data: insertedRow, error: null };

      renderProvider();
      await waitFor(() => expect(ctx).not.toBeNull());

      await act(async () => {
        await ctx!.addComment('  Great feature  ');
      });

      expect(mockChain.insert).toHaveBeenCalledWith({
        page_route: '/dashboard',
        user_id: 'user-1',
        user_display_name: 'Alice',
        body: 'Great feature',
      });
    });

    it('prepends the new comment to the comments list', async () => {
      mockState.fetchResult = { data: [sampleRows[0]], error: null };
      const insertedRow = {
        id: 'new-2',
        page_route: '/dashboard',
        user_id: 'user-1',
        user_display_name: 'Alice',
        body: 'New comment',
        created_at: '2024-06-17T08:00:00Z',
      };
      mockState.insertResult = { data: insertedRow, error: null };

      renderProvider();
      await waitFor(() => expect(ctx!.comments).toHaveLength(1));

      await act(async () => {
        await ctx!.addComment('New comment');
      });

      expect(ctx!.comments).toHaveLength(2);
      expect(ctx!.comments[0].id).toBe('new-2');
    });
  });

  describe('addComment rejects empty/whitespace-only body (Req 5.5)', () => {
    it('throws for empty string', async () => {
      mockState.fetchResult = { data: [], error: null };
      renderProvider();
      await waitFor(() => expect(ctx).not.toBeNull());

      await expect(ctx!.addComment('')).rejects.toThrow('Comment cannot be empty');
      expect(mockChain.insert).not.toHaveBeenCalled();
    });

    it('throws for whitespace-only string', async () => {
      mockState.fetchResult = { data: [], error: null };
      renderProvider();
      await waitFor(() => expect(ctx).not.toBeNull());

      await expect(ctx!.addComment('   \t\n  ')).rejects.toThrow('Comment cannot be empty');
      expect(mockChain.insert).not.toHaveBeenCalled();
    });
  });

  describe('deleteComment removes comment by id (Req 5.6)', () => {
    it('deletes comment owned by current user and removes from local state', async () => {
      mockState.fetchResult = { data: [sampleRows[0]], error: null };

      renderProvider();
      await waitFor(() => expect(ctx!.comments).toHaveLength(1));

      // After fetch completes, wire delete chain: delete().eq().eq() → { error: null }
      // We need a separate chain for the delete path so it doesn't break fetch
      let eqCallCount = 0;
      mockChain.eq.mockImplementation(() => {
        eqCallCount++;
        // The delete path calls .eq twice (id, user_id) — second eq resolves
        if (eqCallCount >= 2) {
          return Promise.resolve({ error: null });
        }
        return mockChain;
      });

      await act(async () => {
        await ctx!.deleteComment('c1');
      });

      expect(ctx!.comments).toHaveLength(0);
    });

    it('does not delete comment owned by another user', async () => {
      // c2 is owned by user-2, current user is user-1
      mockState.fetchResult = { data: [sampleRows[1]], error: null };

      renderProvider();
      await waitFor(() => expect(ctx!.comments).toHaveLength(1));

      await act(async () => {
        await ctx!.deleteComment('c2');
      });

      // Comment should still be there — delete was silently skipped
      expect(ctx!.comments).toHaveLength(1);
      expect(mockFrom).toHaveBeenCalledTimes(1); // only the initial fetch, no delete call
    });
  });

  describe('commentCountForPage returns correct count (Req 5.2)', () => {
    it('returns count of comments matching the given route', async () => {
      mockState.fetchResult = { data: sampleRows, error: null };

      renderProvider();
      await waitFor(() => expect(ctx!.comments).toHaveLength(2));

      expect(ctx!.commentCountForPage('/dashboard')).toBe(2);
      expect(ctx!.commentCountForPage('/settings')).toBe(0);
    });
  });

  describe('Comments ordered by timestamp descending (Req 5.4)', () => {
    it('requests comments ordered by created_at descending from Supabase', async () => {
      mockState.fetchResult = { data: sampleRows, error: null };

      renderProvider();
      await waitFor(() => expect(ctx!.comments).toHaveLength(2));

      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('preserves the order returned by Supabase', async () => {
      // Supabase returns newest first
      mockState.fetchResult = { data: sampleRows, error: null };

      renderProvider();
      await waitFor(() => expect(ctx!.comments).toHaveLength(2));

      expect(ctx!.comments[0].createdAt).toBe('2024-06-15T10:00:00Z');
      expect(ctx!.comments[1].createdAt).toBe('2024-06-14T09:00:00Z');
    });
  });

  describe('togglePanel toggles isOpen state', () => {
    it('starts with isOpen=false and toggles on each call', async () => {
      mockState.fetchResult = { data: [], error: null };

      renderProvider();
      await waitFor(() => expect(ctx).not.toBeNull());

      expect(ctx!.isOpen).toBe(false);

      act(() => ctx!.togglePanel());
      expect(ctx!.isOpen).toBe(true);

      act(() => ctx!.togglePanel());
      expect(ctx!.isOpen).toBe(false);
    });
  });

  describe('Local mode provides no-op implementations', () => {
    it('returns NOOP_VALUE when Supabase is not configured', () => {
      mockState.configured = false;

      renderProvider();

      expect(ctx!.comments).toEqual([]);
      expect(ctx!.commentCountForPage('/any')).toBe(0);
      expect(ctx!.isOpen).toBe(false);
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('returns NOOP_VALUE when user is null', () => {
      mockUser.current = null;

      renderProvider();

      expect(ctx!.comments).toEqual([]);
      expect(ctx!.commentCountForPage('/any')).toBe(0);
      expect(ctx!.isOpen).toBe(false);
    });

    it('addComment is a no-op in local mode', async () => {
      mockState.configured = false;

      renderProvider();

      // Should not throw
      await ctx!.addComment('test');
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('deleteComment is a no-op in local mode', async () => {
      mockState.configured = false;

      renderProvider();

      await ctx!.deleteComment('any-id');
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  describe('useFeedback hook', () => {
    it('throws when used outside FeedbackProvider', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<CtxCapture />)).toThrow(
        'useFeedback must be used within a FeedbackProvider',
      );
      spy.mockRestore();
    });
  });
});
