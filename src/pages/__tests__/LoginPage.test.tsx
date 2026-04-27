import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Hoisted mock state ---
const { mockAuthCtx, mockNavigate, mockSearchParams } = vi.hoisted(() => {
  const navigate = vi.fn();
  const searchParams = new URLSearchParams();

  const authCtx = {
    user: null as { id: string; email: string; displayName: string; avatarInitials: string } | null,
    isLoading: false,
    signIn: vi.fn().mockResolvedValue({}),
    signOut: vi.fn().mockResolvedValue(undefined),
  };

  return { mockAuthCtx: authCtx, mockNavigate: navigate, mockSearchParams: searchParams };
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthCtx,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
}));

import LoginPage from '../LoginPage';

function resetMocks() {
  mockAuthCtx.user = null;
  mockAuthCtx.isLoading = false;
  mockAuthCtx.signIn = vi.fn().mockResolvedValue({});
  mockAuthCtx.signOut = vi.fn().mockResolvedValue(undefined);
  mockNavigate.mockClear();
  // Reset search params by deleting all keys
  for (const key of [...mockSearchParams.keys()]) {
    mockSearchParams.delete(key);
  }
}

describe('LoginPage', () => {
  beforeEach(() => resetMocks());

  describe('Rendering', () => {
    it('renders email and password inputs', () => {
      render(<LoginPage />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });

    it('renders the Sign In button', () => {
      render(<LoginPage />);

      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('renders the heading', () => {
      render(<LoginPage />);

      expect(screen.getByRole('heading', { name: 'Sign in to your account' })).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('email and password inputs are required', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });
  });

  describe('Sign-in flow', () => {
    it('calls signIn with entered email and password', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText('Email'), 'alice@example.com');
      await user.type(screen.getByLabelText('Password'), 'secret123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(mockAuthCtx.signIn).toHaveBeenCalledWith('alice@example.com', 'secret123');
    });

    it('shows loading state while sign-in is in progress', async () => {
      // Make signIn hang so we can observe the loading state
      mockAuthCtx.signIn = vi.fn().mockReturnValue(new Promise(() => {}));
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText('Email'), 'a@b.com');
      await user.type(screen.getByLabelText('Password'), 'pass');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled();
    });
  });

  describe('Error display', () => {
    it('shows error message from AuthContext on invalid credentials', async () => {
      mockAuthCtx.signIn = vi.fn().mockResolvedValue({ error: 'Invalid email or password' });
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText('Email'), 'bad@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrong');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
      });
    });

    it('re-enables the submit button after a failed sign-in', async () => {
      mockAuthCtx.signIn = vi.fn().mockResolvedValue({ error: 'Invalid email or password' });
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText('Email'), 'bad@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrong');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Sign In' })).not.toBeDisabled();
      });
    });

    it('clears previous error when submitting again', async () => {
      // First call fails, second call hangs (so we can observe cleared error)
      let resolveSecond: (v: { error?: string }) => void;
      mockAuthCtx.signIn = vi.fn()
        .mockResolvedValueOnce({ error: 'Invalid email or password' })
        .mockImplementationOnce(() => new Promise((r) => { resolveSecond = r; }));

      const user = userEvent.setup();
      render(<LoginPage />);

      // First attempt — triggers error
      await user.type(screen.getByLabelText('Email'), 'bad@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrong');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Button is back to "Sign In" after failure
      // Second attempt — error should be cleared immediately on submit
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      // While the second signIn is pending, the error should be cleared
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Clean up the hanging promise
      resolveSecond!({});
    });
  });

  describe('Redirect after sign-in', () => {
    it('redirects to returnTo path after successful sign-in', async () => {
      mockSearchParams.set('returnTo', '/automations/campaigns');
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText('Email'), 'alice@example.com');
      await user.type(screen.getByLabelText('Password'), 'secret123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/automations/campaigns', { replace: true });
      });
    });

    it('redirects to / when no returnTo param is present', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText('Email'), 'alice@example.com');
      await user.type(screen.getByLabelText('Password'), 'secret123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('does not navigate when sign-in fails', async () => {
      mockAuthCtx.signIn = vi.fn().mockResolvedValue({ error: 'Invalid email or password' });
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText('Email'), 'bad@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrong');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
