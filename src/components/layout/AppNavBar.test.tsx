import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// --- Hoisted mock state ---
const { mockAuthCtx, mockFlagCtx, mockPlatformAdminCtx } = vi.hoisted(() => {
  const authCtx = {
    user: { id: '1', email: 'test@example.com', displayName: 'Test User', avatarInitials: 'TU' },
    isLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  };

  const flagCtx = {
    flags: {} as Record<string, unknown>,
    isEnabled: vi.fn().mockReturnValue(true),
    isRouteEnabled: vi.fn().mockReturnValue(true),
    isLoading: false,
    setFlagEnabled: vi.fn(),
    createFlag: vi.fn(),
    deleteFlag: vi.fn(),
  };

  const platformAdminCtx = {
    role: 'account-admin' as const,
    isPlatformAdmin: false,
    isSuperAdmin: false,
    canAccessAdmin: true,
    canEdit: true,
  };

  return { mockAuthCtx: authCtx, mockFlagCtx: flagCtx, mockPlatformAdminCtx: platformAdminCtx };
});

// Mock contexts
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthCtx,
}));

vi.mock('../../contexts/FeatureFlagContext', () => ({
  useFeatureFlags: () => mockFlagCtx,
}));

vi.mock('../../contexts/PlatformAdminContext', () => ({
  usePlatformAdmin: () => mockPlatformAdminCtx,
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/dashboard', search: '', hash: '', state: null, key: 'default' }),
  useNavigate: () => vi.fn(),
}));

// Mock child components that have their own context dependencies
vi.mock('./AccountSwitcher', () => ({
  AccountSwitcher: () => <div data-testid="account-switcher">Account Switcher</div>,
}));

vi.mock('./RootAccountSelector', () => ({
  RootAccountSelector: ({ onSelect }: { onSelect: () => void }) => (
    <div data-testid="root-account-selector" onClick={onSelect}>Root Account Selector</div>
  ),
}));

vi.mock('./RoleSimulator', () => ({
  RoleSimulator: () => <div data-testid="role-simulator">Role Simulator</div>,
}));

vi.mock('./WhatsNewPanel', () => ({
  WhatsNewPanel: () => <div data-testid="whats-new">What&apos;s New</div>,
}));

vi.mock('./ChangePasswordModal', () => ({
  ChangePasswordModal: () => <div data-testid="password-modal">Password Modal</div>,
}));

vi.mock('./FeatureFlagsModal', () => ({
  FeatureFlagsModal: () => <div data-testid="flags-modal">Flags Modal</div>,
}));

vi.mock('../shared/ResetAccountButton', () => ({
  ResetAccountButton: () => <button data-testid="reset-account">Reset</button>,
}));

import { AppNavBar } from './AppNavBar';

describe('AppNavBar dark mode toggle', () => {
  beforeEach(() => {
    // Reset document root data-theme before each test
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  async function openAvatarDropdown() {
    const user = userEvent.setup();
    const avatarButton = screen.getByLabelText('User profile');
    await user.click(avatarButton);
  }

  it('renders Switch component with "Dark Mode" label in avatar dropdown', async () => {
    render(<AppNavBar />);
    await openAvatarDropdown();

    // Should have a "Dark Mode" label
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();

    // Should have a switch (radix switch renders with role="switch")
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('Switch is checked when darkMode state is true (data-theme="dark")', async () => {
    // Set dark mode before render so initial state picks it up
    document.documentElement.setAttribute('data-theme', 'dark');

    render(<AppNavBar />);
    await openAvatarDropdown();

    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('data-state', 'checked');
  });

  it('Switch is unchecked when darkMode state is false (no data-theme)', async () => {
    render(<AppNavBar />);
    await openAvatarDropdown();

    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('data-state', 'unchecked');
  });

  it('clicking Switch toggles data-theme on document root', async () => {
    render(<AppNavBar />);
    const user = userEvent.setup();
    await openAvatarDropdown();

    const switchEl = screen.getByRole('switch');

    // Initially unchecked, no data-theme
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    expect(switchEl).toHaveAttribute('data-state', 'unchecked');

    // Click to enable dark mode
    await user.click(switchEl);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('does not render a text button with "Light Mode" or "Dark Mode" text in dropdown', async () => {
    render(<AppNavBar />);
    await openAvatarDropdown();

    // Query all buttons with role="menuitem" in the dropdown
    const menuItems = screen.getAllByRole('menuitem');

    // None of the menu item buttons should have "Light Mode" or "Dark Mode" text
    for (const item of menuItems) {
      expect(item.textContent).not.toBe('Light Mode');
      expect(item.textContent).not.toBe('Dark Mode');
    }

    // The "Dark Mode" text exists as a label, not as a clickable button/menuitem
    const darkModeLabel = screen.getByText('Dark Mode');
    expect(darkModeLabel.tagName.toLowerCase()).toBe('span');
    expect(darkModeLabel).not.toHaveAttribute('role', 'menuitem');
  });
});
