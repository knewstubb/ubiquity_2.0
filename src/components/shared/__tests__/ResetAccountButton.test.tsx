import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Hoisted mock state ---
const { mockRpc, mockAuthCtx, mockShowToast, mockIsConfigured } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockAuthCtx: {
    user: null as { id: string; email: string; displayName: string; avatarInitials: string } | null,
    isLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
  mockShowToast: vi.fn(),
  mockIsConfigured: vi.fn().mockReturnValue(true),
}));

vi.mock('../../../lib/supabase', () => ({
  supabase: { rpc: mockRpc },
  isSupabaseConfigured: mockIsConfigured,
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthCtx,
}));

vi.mock('../Toast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

import { ResetAccountButton } from '../ResetAccountButton';

describe('ResetAccountButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthCtx.user = { id: 'user-1', email: 'a@b.com', displayName: 'Alice', avatarInitials: 'AL' };
    mockIsConfigured.mockReturnValue(true);
    mockRpc.mockResolvedValue({ error: null });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('renders the reset button when Supabase is configured', () => {
    render(<ResetAccountButton />);
    expect(screen.getByRole('menuitem', { name: /reset account/i })).toBeInTheDocument();
  });

  it('returns null when Supabase is not configured', () => {
    mockIsConfigured.mockReturnValue(false);
    const { container } = render(<ResetAccountButton />);
    expect(container.innerHTML).toBe('');
  });

  it('calls Supabase RPC with current user ID on click after confirmation', async () => {
    const user = userEvent.setup();
    render(<ResetAccountButton />);

    await user.click(screen.getByRole('menuitem', { name: /reset account/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockRpc).toHaveBeenCalledWith('reset_user_data', { target_user_id: 'user-1' });
  });

  it('shows success toast after successful reset', async () => {
    const user = userEvent.setup();
    render(<ResetAccountButton />);

    await user.click(screen.getByRole('menuitem', { name: /reset account/i }));

    expect(mockShowToast).toHaveBeenCalledWith('Account data reset successfully', 'success');
  });

  it('does not call RPC when user cancels confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    render(<ResetAccountButton />);

    await user.click(screen.getByRole('menuitem', { name: /reset account/i }));

    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('shows error toast when RPC fails', async () => {
    mockRpc.mockResolvedValue({ error: { message: 'RPC failed' } });
    const user = userEvent.setup();
    render(<ResetAccountButton />);

    await user.click(screen.getByRole('menuitem', { name: /reset account/i }));

    expect(mockShowToast).toHaveBeenCalledWith(expect.any(String), 'error');
  });
});
