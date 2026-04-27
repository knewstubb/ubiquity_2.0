import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Hoisted mock state (runs before any imports) ---
const { mockState, mockAuth } = vi.hoisted(() => {
  const state = {
    configured: true,
    session: null as unknown,
    signInError: null as unknown,
    authChangeCallback: null as ((event: string, session: unknown) => void) | null,
  };

  const unsubscribe = vi.fn();

  const auth = {
    getSession: vi.fn().mockImplementation(() =>
      Promise.resolve({ data: { session: state.session } }),
    ),
    onAuthStateChange: vi.fn().mockImplementation((cb: (event: string, session: unknown) => void) => {
      state.authChangeCallback = cb;
      return { data: { subscription: { unsubscribe } } };
    }),
    signInWithPassword: vi.fn().mockImplementation(() =>
      state.signInError
        ? Promise.resolve({ error: state.signInError })
        : Promise.resolve({ error: null }),
    ),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    _unsubscribe: unsubscribe,
  };

  return { mockState: state, mockAuth: auth };
});

vi.mock('../../lib/supabase', () => ({
  get supabase() {
    return mockState.configured ? { auth: mockAuth } : null;
  },
  isSupabaseConfigured: () => mockState.configured,
}));

import { AuthProvider, useAuth } from '../AuthContext';
import type { AuthContextValue } from '../AuthContext';

// Helper component that exposes context values for testing
function TestConsumer() {
  const ctx = useAuth();
  return (
    <div>
      <span data-testid="is-loading">{String(ctx.isLoading)}</span>
      <span data-testid="user-id">{ctx.user?.id ?? 'null'}</span>
      <span data-testid="user-email">{ctx.user?.email ?? 'null'}</span>
      <span data-testid="user-display-name">{ctx.user?.displayName ?? 'null'}</span>
      <span data-testid="user-initials">{ctx.user?.avatarInitials ?? 'null'}</span>
      <button onClick={() => ctx.signIn('test@example.com', 'password123')}>Sign In</button>
      <button onClick={() => ctx.signOut()}>Sign Out</button>
    </div>
  );
}

// Helper to capture context value via ref
let capturedCtx: AuthContextValue | null = null;
function CtxCapture() {
  capturedCtx = useAuth();
  return null;
}

function renderAuth() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

function resetMocks() {
  mockState.configured = true;
  mockState.session = null;
  mockState.signInError = null;
  mockState.authChangeCallback = null;
  vi.clearAllMocks();
  // Re-wire after clearAllMocks
  mockAuth.getSession.mockImplementation(() =>
    Promise.resolve({ data: { session: mockState.session } }),
  );
  mockAuth.onAuthStateChange.mockImplementation((cb: (event: string, session: unknown) => void) => {
    mockState.authChangeCallback = cb;
    return { data: { subscription: { unsubscribe: mockAuth._unsubscribe } } };
  });
  mockAuth.signInWithPassword.mockImplementation(() =>
    mockState.signInError
      ? Promise.resolve({ error: mockState.signInError })
      : Promise.resolve({ error: null }),
  );
  mockAuth.signOut.mockResolvedValue({ error: null });
}

const fakeSupabaseUser = {
  id: 'user-123',
  email: 'alice@example.com',
  user_metadata: {},
};

const fakeSession = { user: fakeSupabaseUser };

describe('AuthContext', () => {
  beforeEach(() => resetMocks());

  describe('Supabase mode (configured)', () => {
    it('starts with isLoading=true and user=null while session is being resolved', () => {
      // Don't resolve getSession yet — keep it pending
      mockAuth.getSession.mockReturnValue(new Promise(() => {}));
      renderAuth();

      expect(screen.getByTestId('is-loading').textContent).toBe('true');
      expect(screen.getByTestId('user-id').textContent).toBe('null');
    });

    it('sets isLoading=false and user after getSession resolves with a session', async () => {
      mockState.session = fakeSession;
      renderAuth();

      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('user-id').textContent).toBe('user-123');
      expect(screen.getByTestId('user-email').textContent).toBe('alice@example.com');
    });

    it('sets user=null when getSession resolves with no session', async () => {
      mockState.session = null;
      renderAuth();

      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('user-id').textContent).toBe('null');
    });

    it('subscribes to onAuthStateChange on mount', async () => {
      renderAuth();
      await waitFor(() => {
        expect(mockAuth.onAuthStateChange).toHaveBeenCalledTimes(1);
      });
    });

    it('unsubscribes from onAuthStateChange on unmount', async () => {
      const { unmount } = renderAuth();
      await waitFor(() => {
        expect(mockAuth.onAuthStateChange).toHaveBeenCalled();
      });
      unmount();
      expect(mockAuth._unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Session restoration via onAuthStateChange', () => {
    it('updates user when onAuthStateChange fires with a session', async () => {
      mockState.session = null;
      renderAuth();

      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('user-id').textContent).toBe('null');

      // Simulate auth state change (e.g., token refresh restores session)
      act(() => {
        mockState.authChangeCallback?.('SIGNED_IN', fakeSession);
      });

      expect(screen.getByTestId('user-id').textContent).toBe('user-123');
      expect(screen.getByTestId('user-email').textContent).toBe('alice@example.com');
    });

    it('clears user when onAuthStateChange fires with null session', async () => {
      mockState.session = fakeSession;
      renderAuth();

      await waitFor(() => {
        expect(screen.getByTestId('user-id').textContent).toBe('user-123');
      });

      act(() => {
        mockState.authChangeCallback?.('SIGNED_OUT', null);
      });

      expect(screen.getByTestId('user-id').textContent).toBe('null');
    });
  });

  describe('Sign-in flow', () => {
    it('calls signInWithPassword with email and password', async () => {
      const user = userEvent.setup();
      renderAuth();
      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });

      await user.click(screen.getByText('Sign In'));

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('returns no error on successful sign-in', async () => {
      capturedCtx = null;
      render(
        <AuthProvider>
          <CtxCapture />
        </AuthProvider>,
      );
      await waitFor(() => {
        expect(capturedCtx?.isLoading).toBe(false);
      });

      const result = await capturedCtx!.signIn('test@example.com', 'password123');
      expect(result).toEqual({});
      expect(result.error).toBeUndefined();
    });

    it('returns error message on failed sign-in', async () => {
      mockState.signInError = { message: 'Invalid login credentials' };

      capturedCtx = null;
      render(
        <AuthProvider>
          <CtxCapture />
        </AuthProvider>,
      );
      await waitFor(() => {
        expect(capturedCtx?.isLoading).toBe(false);
      });

      const result = await capturedCtx!.signIn('bad@example.com', 'wrong');
      expect(result).toEqual({ error: 'Invalid email or password' });
    });
  });

  describe('Sign-out flow', () => {
    it('calls supabase signOut and clears user', async () => {
      mockState.session = fakeSession;
      const user = userEvent.setup();
      renderAuth();

      await waitFor(() => {
        expect(screen.getByTestId('user-id').textContent).toBe('user-123');
      });

      await user.click(screen.getByText('Sign Out'));

      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(screen.getByTestId('user-id').textContent).toBe('null');
    });
  });

  describe('User object mapping', () => {
    it('derives displayName from email prefix when no display_name metadata', async () => {
      mockState.session = {
        user: { id: 'u-1', email: 'bob.smith@example.com', user_metadata: {} },
      };
      renderAuth();

      await waitFor(() => {
        expect(screen.getByTestId('user-display-name').textContent).toBe('bob.smith');
      });
    });

    it('uses display_name from user_metadata when available', async () => {
      mockState.session = {
        user: { id: 'u-2', email: 'alice@example.com', user_metadata: { display_name: 'Alice Wonderland' } },
      };
      renderAuth();

      await waitFor(() => {
        expect(screen.getByTestId('user-display-name').textContent).toBe('Alice Wonderland');
      });
      expect(screen.getByTestId('user-initials').textContent).toBe('AW');
    });

    it('computes two-letter initials from single-word name', async () => {
      mockState.session = {
        user: { id: 'u-3', email: 'x@example.com', user_metadata: { display_name: 'Alice' } },
      };
      renderAuth();

      await waitFor(() => {
        expect(screen.getByTestId('user-initials').textContent).toBe('AL');
      });
    });

    it('computes initials from first and last name', async () => {
      mockState.session = {
        user: { id: 'u-4', email: 'x@example.com', user_metadata: { display_name: 'John Michael Doe' } },
      };
      renderAuth();

      await waitFor(() => {
        expect(screen.getByTestId('user-initials').textContent).toBe('JD');
      });
    });

    it('falls back to "User" displayName when no email and no metadata', async () => {
      mockState.session = {
        user: { id: 'u-5', user_metadata: {} },
      };
      renderAuth();

      await waitFor(() => {
        expect(screen.getByTestId('user-display-name').textContent).toBe('User');
      });
    });
  });

  describe('Local mode (Supabase not configured)', () => {
    beforeEach(() => {
      mockState.configured = false;
    });

    it('starts with mock user and isLoading=false immediately', () => {
      renderAuth();

      expect(screen.getByTestId('is-loading').textContent).toBe('false');
      expect(screen.getByTestId('user-id').textContent).toBe('local-user');
      expect(screen.getByTestId('user-email').textContent).toBe('local@ubiquity.dev');
      expect(screen.getByTestId('user-display-name').textContent).toBe('Local User');
      expect(screen.getByTestId('user-initials').textContent).toBe('LU');
    });

    it('signIn sets mock user in local mode', async () => {
      mockState.configured = false;
      renderAuth();

      // Sign out first to clear user
      const user = userEvent.setup();
      await user.click(screen.getByText('Sign Out'));
      expect(screen.getByTestId('user-id').textContent).toBe('null');

      await user.click(screen.getByText('Sign In'));
      expect(screen.getByTestId('user-id').textContent).toBe('local-user');
      expect(mockAuth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('signOut clears user in local mode', async () => {
      mockState.configured = false;
      const user = userEvent.setup();
      renderAuth();

      expect(screen.getByTestId('user-id').textContent).toBe('local-user');

      await user.click(screen.getByText('Sign Out'));

      expect(screen.getByTestId('user-id').textContent).toBe('null');
      expect(mockAuth.signOut).not.toHaveBeenCalled();
    });
  });

  describe('useAuth hook', () => {
    it('throws when used outside AuthProvider', () => {
      // Suppress React error boundary console output
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
      spy.mockRestore();
    });
  });
});
