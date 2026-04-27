import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mock state
// ---------------------------------------------------------------------------
const {
  mockSession,
  mockOnAuthStateChange,
  mockRpc,
  mockFeatureFlagsSelect,
  mockIsConfigured,
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

  const mockRpc = vi.fn();
  const mockFeatureFlagsSelect = vi.fn();
  const mockIsConfigured = { current: true };

  return {
    mockSession,
    mockOnAuthStateChange,
    mockRpc,
    mockFeatureFlagsSelect,
    mockIsConfigured,
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
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: (table: string) => {
      if (table === 'feature_flags') {
        return { select: mockFeatureFlagsSelect };
      }
      return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
    },
  },
  isSupabaseConfigured: () => mockIsConfigured.current,
}));

// ---------------------------------------------------------------------------
// Real component imports (after mocks)
// ---------------------------------------------------------------------------
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../../components/shared/Toast';
import { ResetAccountButton } from '../../components/shared/ResetAccountButton';

// ---------------------------------------------------------------------------
// Test constants
// ---------------------------------------------------------------------------
const TEST_USER = {
  id: 'user-reset-1',
  email: 'reviewer@ubiquity.dev',
  user_metadata: { display_name: 'Reset Reviewer' },
};

const TEST_SESSION = { user: TEST_USER };

// ---------------------------------------------------------------------------
// Render helper — authenticated user with real providers
// ---------------------------------------------------------------------------
function renderResetButton() {
  return render(
    <AuthProvider>
      <ToastProvider>
        <ResetAccountButton />
      </ToastProvider>
    </AuthProvider>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Per-user data reset via RPC integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.current = TEST_SESSION;
    mockIsConfigured.current = true;
    mockRpc.mockResolvedValue({ error: null });
    mockFeatureFlagsSelect.mockReturnValue(
      Promise.resolve({ data: [], error: null }),
    );
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  // -----------------------------------------------------------------------
  // 1. Clicking reset calls Supabase RPC with current user's ID
  // Validates: Requirement 4.4
  // -----------------------------------------------------------------------
  it('calls Supabase RPC reset_user_data with the current user ID', async () => {
    const user = userEvent.setup();
    renderResetButton();

    // Wait for auth to resolve and button to render
    const button = await screen.findByRole('menuitem', { name: /reset account/i });
    await user.click(button);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockRpc).toHaveBeenCalledWith('reset_user_data', {
      target_user_id: TEST_USER.id,
    });
  });

  // -----------------------------------------------------------------------
  // 2. Shows success toast after successful reset
  // Validates: Requirement 4.4
  // -----------------------------------------------------------------------
  it('shows success toast after successful reset', async () => {
    const user = userEvent.setup();
    renderResetButton();

    const button = await screen.findByRole('menuitem', { name: /reset account/i });
    await user.click(button);

    // The real ToastProvider renders toast messages in the DOM
    await waitFor(() => {
      expect(
        screen.getByText('Account data reset successfully'),
      ).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // 3. Shows error toast when RPC fails
  // Validates: Requirement 4.4
  // -----------------------------------------------------------------------
  it('shows error toast when RPC fails', async () => {
    mockRpc.mockResolvedValue({ error: { message: 'RPC failed' } });
    const user = userEvent.setup();
    renderResetButton();

    const button = await screen.findByRole('menuitem', { name: /reset account/i });
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to reset account data'),
      ).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // 4. Does not call RPC when user cancels the confirmation dialog
  // Validates: Requirement 4.4
  // -----------------------------------------------------------------------
  it('does not call RPC when user cancels the confirmation dialog', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    renderResetButton();

    const button = await screen.findByRole('menuitem', { name: /reset account/i });
    await user.click(button);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // 5. Button is not rendered when Supabase is not configured
  // Validates: Requirement 4.4
  // -----------------------------------------------------------------------
  it('does not render the button when Supabase is not configured', async () => {
    mockIsConfigured.current = false;
    renderResetButton();

    // Give auth time to resolve
    await waitFor(() => {
      expect(
        screen.queryByRole('menuitem', { name: /reset account/i }),
      ).not.toBeInTheDocument();
    });
  });
});
