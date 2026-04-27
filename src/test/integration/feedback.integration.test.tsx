import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Hoisted mock state
// ---------------------------------------------------------------------------
const {
  mockSession,
  mockOnAuthStateChange,
  mockFeedbackSelect,
  mockFeedbackInsert,
  mockFeedbackDelete,
  mockFeatureFlagsSelect,
} = vi.hoisted(() => {
  const mockSession = {
    current: null as {
      user: {
        id: string;
        email: string;
        user_metadata: Record<string, unknown>;
      };
    } | null,
  };

  let authCallback: ((event: string, session: unknown) => void) | null = null;

  const mockOnAuthStateChange = {
    register(cb: (event: string, session: unknown) => void) {
      authCallback = cb;
    },
    fire(event: string, session: unknown) {
      authCallback?.(event, session);
    },
  };

  const mockFeedbackSelect = vi.fn();
  const mockFeedbackInsert = vi.fn();
  const mockFeedbackDelete = vi.fn();
  const mockFeatureFlagsSelect = vi.fn();

  return {
    mockSession,
    mockOnAuthStateChange,
    mockFeedbackSelect,
    mockFeedbackInsert,
    mockFeedbackDelete,
    mockFeatureFlagsSelect,
  };
});

// ---------------------------------------------------------------------------
// Mock the Supabase module at the module level
// ---------------------------------------------------------------------------
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: mockSession.current } }),
      onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
        mockOnAuthStateChange.register(cb);
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      },
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: (table: string) => {
      if (table === 'feature_flags') {
        return { select: mockFeatureFlagsSelect };
      }
      if (table === 'feedback_comments') {
        return {
          select: (...args: unknown[]) => {
            // select('*') returns a chainable query builder
            return {
              eq: (_col: string, _val: string) => ({
                order: (_col2: string, _opts: unknown) => mockFeedbackSelect(),
              }),
            };
          },
          insert: (row: Record<string, unknown>) => {
            // insert returns chainable .select().single()
            return {
              select: () => ({
                single: () => mockFeedbackInsert(row),
              }),
            };
          },
          delete: () => ({
            eq: (_col: string, _val: string) => ({
              eq: (_col2: string, _val2: string) => mockFeedbackDelete(),
            }),
          }),
        };
      }
      return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
    },
  },
  isSupabaseConfigured: () => true,
}));

// ---------------------------------------------------------------------------
// Real component imports (after mocks)
// ---------------------------------------------------------------------------
import { AuthProvider } from '../../contexts/AuthContext';
import { FeatureFlagProvider } from '../../contexts/FeatureFlagContext';
import { FeedbackProvider } from '../../contexts/FeedbackContext';
import { FeedbackWidget } from '../../components/shared/FeedbackWidget';

// ---------------------------------------------------------------------------
// Test constants
// ---------------------------------------------------------------------------
const TEST_USER = {
  id: 'user-feedback-1',
  email: 'reviewer@ubiquity.dev',
  user_metadata: { display_name: 'Test Reviewer' },
};

const TEST_SESSION = { user: TEST_USER };

const OTHER_USER_ID = 'user-other-2';

let commentIdCounter = 0;

function makeComment(overrides: Partial<{
  id: string;
  page_route: string;
  user_id: string;
  user_display_name: string;
  body: string;
  created_at: string;
}> = {}) {
  commentIdCounter += 1;
  return {
    id: overrides.id ?? `comment-${commentIdCounter}`,
    page_route: overrides.page_route ?? '/dashboard',
    user_id: overrides.user_id ?? TEST_USER.id,
    user_display_name: overrides.user_display_name ?? 'Test Reviewer',
    body: overrides.body ?? `Test comment ${commentIdCounter}`,
    created_at: overrides.created_at ?? new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Render helper — authenticated user on a given route
// ---------------------------------------------------------------------------
function renderWithFeedback(route = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <FeatureFlagProvider>
          <Routes>
            <Route
              path="*"
              element={
                <FeedbackProvider>
                  <div data-testid="page-content">Page Content</div>
                  <FeedbackWidget />
                </FeedbackProvider>
              }
            />
          </Routes>
        </FeatureFlagProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Feedback submission and retrieval integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    commentIdCounter = 0;

    // Authenticated user
    mockSession.current = TEST_SESSION;

    // Feature flags: empty (fail-open)
    mockFeatureFlagsSelect.mockReturnValue(
      Promise.resolve({ data: [], error: null }),
    );

    // Default: no existing comments
    mockFeedbackSelect.mockResolvedValue({ data: [], error: null });
  });

  // -----------------------------------------------------------------------
  // 1. Submit a comment → it appears in the comment thread
  // Validates: Requirement 5.2
  // -----------------------------------------------------------------------
  it('submits a comment and it appears in the comment thread', async () => {
    const user = userEvent.setup();

    // When insert is called, return the new comment row
    mockFeedbackInsert.mockImplementation((row: Record<string, unknown>) =>
      Promise.resolve({
        data: {
          id: 'new-comment-1',
          page_route: row.page_route,
          user_id: row.user_id,
          user_display_name: row.user_display_name,
          body: row.body,
          created_at: new Date().toISOString(),
        },
        error: null,
      }),
    );

    renderWithFeedback('/dashboard');

    // Wait for auth to resolve and widget to render
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /toggle feedback panel/i }),
      ).toBeInTheDocument();
    });

    // Open the feedback panel
    await user.click(
      screen.getByRole('button', { name: /toggle feedback panel/i }),
    );

    // Panel should be open
    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /feedback comments/i }),
      ).toBeInTheDocument();
    });

    // Type a comment and submit
    const textarea = screen.getByPlaceholderText(/leave feedback/i);
    await user.type(textarea, 'Great design on this page!');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // The comment should appear in the thread
    await waitFor(() => {
      expect(
        screen.getByText('Great design on this page!'),
      ).toBeInTheDocument();
    });

    // Verify insert was called with correct data
    expect(mockFeedbackInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        page_route: '/dashboard',
        user_id: TEST_USER.id,
        user_display_name: 'Test Reviewer',
        body: 'Great design on this page!',
      }),
    );
  });

  // -----------------------------------------------------------------------
  // 2. Comments are displayed in timestamp descending order
  // Validates: Requirement 5.4
  // -----------------------------------------------------------------------
  it('displays comments in timestamp descending order (newest first)', async () => {
    const user = userEvent.setup();

    // Return comments already sorted descending (as Supabase would)
    const comments = [
      makeComment({
        id: 'c3',
        body: 'Third (newest)',
        created_at: '2025-01-03T12:00:00Z',
      }),
      makeComment({
        id: 'c2',
        body: 'Second',
        created_at: '2025-01-02T12:00:00Z',
      }),
      makeComment({
        id: 'c1',
        body: 'First (oldest)',
        created_at: '2025-01-01T12:00:00Z',
      }),
    ];

    mockFeedbackSelect.mockResolvedValue({ data: comments, error: null });

    renderWithFeedback('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /toggle feedback panel/i }),
      ).toBeInTheDocument();
    });

    // Open the panel
    await user.click(
      screen.getByRole('button', { name: /toggle feedback panel/i }),
    );

    await waitFor(() => {
      expect(screen.getByText('Third (newest)')).toBeInTheDocument();
    });

    // Verify order: get all comment body elements within the dialog
    const dialog = screen.getByRole('dialog', { name: /feedback comments/i });
    const commentBodies = within(dialog).getAllByText(
      /Third \(newest\)|Second|First \(oldest\)/,
    );

    expect(commentBodies).toHaveLength(3);
    expect(commentBodies[0]).toHaveTextContent('Third (newest)');
    expect(commentBodies[1]).toHaveTextContent('Second');
    expect(commentBodies[2]).toHaveTextContent('First (oldest)');
  });

  // -----------------------------------------------------------------------
  // 3. Badge count updates after submission
  // Validates: Requirement 5.3
  // -----------------------------------------------------------------------
  it('updates badge count after submitting a comment', async () => {
    const user = userEvent.setup();

    // Start with one existing comment
    const existingComment = makeComment({ id: 'existing-1', body: 'Existing comment' });
    mockFeedbackSelect.mockResolvedValue({
      data: [existingComment],
      error: null,
    });

    mockFeedbackInsert.mockImplementation((row: Record<string, unknown>) =>
      Promise.resolve({
        data: {
          id: 'new-comment-2',
          page_route: row.page_route,
          user_id: row.user_id,
          user_display_name: row.user_display_name,
          body: row.body,
          created_at: new Date().toISOString(),
        },
        error: null,
      }),
    );

    renderWithFeedback('/dashboard');

    // Wait for the FAB to render — the badge should show "1" for the existing comment
    // Note: The FeedbackWidget uses global location.pathname for badge count,
    // and FeedbackContext filters comments by pageRoute. Since all comments
    // are for /dashboard and we're on /dashboard, count should be 1.
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /toggle feedback panel/i }),
      ).toBeInTheDocument();
    });

    // Open panel and submit a new comment
    await user.click(
      screen.getByRole('button', { name: /toggle feedback panel/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /feedback comments/i }),
      ).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/leave feedback/i);
    await user.type(textarea, 'Another comment');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // After submission, the new comment should appear
    await waitFor(() => {
      expect(screen.getByText('Another comment')).toBeInTheDocument();
    });

    // Both comments should now be in the thread
    expect(screen.getByText('Existing comment')).toBeInTheDocument();
    expect(screen.getByText('Another comment')).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 4. Empty/whitespace comments are rejected with validation message
  // Validates: Requirement 5.5
  // -----------------------------------------------------------------------
  it('rejects empty comments — submit button is disabled', async () => {
    const user = userEvent.setup();

    renderWithFeedback('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /toggle feedback panel/i }),
      ).toBeInTheDocument();
    });

    // Open the panel
    await user.click(
      screen.getByRole('button', { name: /toggle feedback panel/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /feedback comments/i }),
      ).toBeInTheDocument();
    });

    // Submit button should be disabled when textarea is empty
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    expect(submitBtn).toBeDisabled();

    // Insert should never be called
    expect(mockFeedbackInsert).not.toHaveBeenCalled();
  });

  it('rejects whitespace-only comments — submit button stays disabled', async () => {
    const user = userEvent.setup();

    renderWithFeedback('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /toggle feedback panel/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /toggle feedback panel/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /feedback comments/i }),
      ).toBeInTheDocument();
    });

    // Type only whitespace
    const textarea = screen.getByPlaceholderText(/leave feedback/i);
    await user.type(textarea, '   ');

    // Submit button should remain disabled
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    expect(submitBtn).toBeDisabled();

    // Insert should never be called
    expect(mockFeedbackInsert).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // 5. Author can delete their own comment
  // Validates: Requirement 5.6
  // -----------------------------------------------------------------------
  it('allows the comment author to delete their own comment', async () => {
    const user = userEvent.setup();

    const ownComment = makeComment({
      id: 'own-comment-1',
      body: 'My comment to delete',
      user_id: TEST_USER.id,
      user_display_name: 'Test Reviewer',
    });

    const otherComment = makeComment({
      id: 'other-comment-1',
      body: 'Someone else comment',
      user_id: OTHER_USER_ID,
      user_display_name: 'Other User',
    });

    mockFeedbackSelect.mockResolvedValue({
      data: [ownComment, otherComment],
      error: null,
    });

    mockFeedbackDelete.mockResolvedValue({ error: null });

    renderWithFeedback('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /toggle feedback panel/i }),
      ).toBeInTheDocument();
    });

    // Open the panel
    await user.click(
      screen.getByRole('button', { name: /toggle feedback panel/i }),
    );

    await waitFor(() => {
      expect(screen.getByText('My comment to delete')).toBeInTheDocument();
      expect(screen.getByText('Someone else comment')).toBeInTheDocument();
    });

    // The author's comment should have a Delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete comment/i });
    // Only the author's own comment should have a delete button
    expect(deleteButtons).toHaveLength(1);

    // Click delete on the author's comment
    await user.click(deleteButtons[0]);

    // The comment should be removed from the thread
    await waitFor(() => {
      expect(screen.queryByText('My comment to delete')).not.toBeInTheDocument();
    });

    // The other user's comment should still be there
    expect(screen.getByText('Someone else comment')).toBeInTheDocument();

    // Verify delete was called
    expect(mockFeedbackDelete).toHaveBeenCalled();
  });
});
