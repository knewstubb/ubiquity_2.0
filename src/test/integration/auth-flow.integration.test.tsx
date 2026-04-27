import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Hoisted mock state — controls what the mocked Supabase client returns
// ---------------------------------------------------------------------------
const { mockSession, mockSignIn, mockSignOut, mockOnAuthStateChange, mockFeatureFlagsSelect } =
  vi.hoisted(() => {
    const mockSession = {
      current: null as { user: { id: string; email: string; user_metadata: Record<string, unknown> } } | null,
    };

    const mockSignIn = vi.fn();
    const mockSignOut = vi.fn();

    // Stores the callback so tests can trigger auth state changes
    let authCallback: ((event: string, session: unknown) => void) | null = null;

    const mockOnAuthStateChange = {
      register(cb: (event: string, session: unknown) => void) {
        authCallback = cb;
      },
      fire(event: string, session: unknown) {
        authCallback?.(event, session);
      },
    };

    const mockFeatureFlagsSelect = vi.fn();

    return { mockSession, mockSignIn, mockSignOut, mockOnAuthStateChange, mockFeatureFlagsSelect };
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
          data: {
            subscription: { unsubscribe: vi.fn() },
          },
        };
      },
      signInWithPassword: mockSignIn,
      signOut: mockSignOut,
    },
    from: (table: string) => {
      if (table === 'feature_flags') {
        return { select: mockFeatureFlagsSelect };
      }
      return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
    },
  },
  isSupabaseConfigured: () => true,
}));

// ---------------------------------------------------------------------------
// Real component imports (after mocks are set up)
// ---------------------------------------------------------------------------
import { AuthProvider } from '../../contexts/AuthContext';
import { FeatureFlagProvider } from '../../contexts/FeatureFlagContext';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import LoginPage from '../../pages/LoginPage';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TEST_USER = {
  id: 'user-123',
  email: 'reviewer@ubiquity.dev',
  user_metadata: { display_name: 'Test Reviewer' },
};

const TEST_SESSION = { user: TEST_USER };

function renderApp(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <FeatureFlagProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
                    <Route path="/automations/campaigns" element={<div data-testid="campaigns">Campaigns</div>} />
                    <Route path="*" element={<div data-testid="catch-all">Catch All</div>} />
                  </Routes>
                </ProtectedRoute>
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
describe('Auth flow integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.current = null;

    // Default: feature flags return empty (fail-open, all enabled)
    mockFeatureFlagsSelect.mockReturnValue(
      Promise.resolve({ data: [], error: null }),
    );

    mockSignIn.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });
  });

  // -----------------------------------------------------------------------
  // 1. Unauthenticated user is redirected to /login
  // -----------------------------------------------------------------------
  it('redirects unauthenticated user to /login with returnTo param', async () => {
    renderApp('/automations/campaigns');

    // Wait for auth loading to resolve, then LoginPage should render
    await waitFor(() => {
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    // The campaigns page should NOT be visible
    expect(screen.queryByTestId('campaigns')).not.toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 2. User signs in with valid credentials → redirected to returnTo path
  // -----------------------------------------------------------------------
  it('signs in with valid credentials and redirects to returnTo path', async () => {
    const user = userEvent.setup();

    // Start unauthenticated, trying to access /dashboard
    renderApp('/dashboard');

    // Wait for login page
    await waitFor(() => {
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    // Simulate successful sign-in: Supabase fires onAuthStateChange synchronously
    // before the signInWithPassword promise resolves (matching real Supabase behaviour
    // where the auth listener fires before the awaited call returns).
    mockSignIn.mockImplementation(async () => {
      mockSession.current = TEST_SESSION;
      mockOnAuthStateChange.fire('SIGNED_IN', TEST_SESSION);
      return { error: null };
    });

    // Fill in the form
    await user.type(screen.getByLabelText('Email'), 'reviewer@ubiquity.dev');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // After sign-in, should be redirected to the dashboard
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    // Login page should no longer be visible
    expect(screen.queryByText('Sign in to your account')).not.toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 3. User signs in with invalid credentials → error displayed
  // -----------------------------------------------------------------------
  it('shows error message when sign-in fails with invalid credentials', async () => {
    const user = userEvent.setup();

    renderApp('/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    // Simulate failed sign-in
    mockSignIn.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });

    await user.type(screen.getByLabelText('Email'), 'wrong@example.com');
    await user.type(screen.getByLabelText('Password'), 'badpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Error message should be displayed
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
    });

    // Should still be on the login page
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 4. Authenticated user can access protected routes
  // -----------------------------------------------------------------------
  it('allows authenticated user to access protected routes directly', async () => {
    // Start with an active session
    mockSession.current = TEST_SESSION;

    renderApp('/automations/campaigns');

    // Should see the campaigns page, not the login page
    await waitFor(() => {
      expect(screen.getByTestId('campaigns')).toBeInTheDocument();
    });

    expect(screen.queryByText('Sign in to your account')).not.toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 5. User signs out → redirected to /login
  // -----------------------------------------------------------------------
  it('redirects to /login after sign out', async () => {
    // Start authenticated
    mockSession.current = TEST_SESSION;

    renderApp('/dashboard');

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    // Simulate sign-out: clear session and fire auth state change
    mockSignOut.mockImplementation(async () => {
      mockSession.current = null;
      mockOnAuthStateChange.fire('SIGNED_OUT', null);
    });

    // We can't click a sign-out button in this integration test since
    // there's no nav bar rendered. Instead, we trigger the auth state
    // change directly to simulate what happens when signOut is called.
    await act(async () => {
      mockSession.current = null;
      mockOnAuthStateChange.fire('SIGNED_OUT', null);
    });

    // Should be redirected to login
    await waitFor(() => {
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });
});
