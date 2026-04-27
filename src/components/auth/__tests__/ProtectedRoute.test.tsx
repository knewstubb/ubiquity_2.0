import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Hoisted mock state ---
const { mockAuthCtx, mockFlagCtx, mockLocation } = vi.hoisted(() => {
  const authCtx = {
    user: null as { id: string; email: string; displayName: string; avatarInitials: string } | null,
    isLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  };

  const flagCtx = {
    flags: {} as Record<string, unknown>,
    isEnabled: vi.fn().mockReturnValue(true),
    isRouteEnabled: vi.fn().mockReturnValue(true),
    isLoading: false,
  };

  const location = {
    pathname: '/dashboard',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  };

  return { mockAuthCtx: authCtx, mockFlagCtx: flagCtx, mockLocation: location };
});

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthCtx,
}));

vi.mock('../../../contexts/FeatureFlagContext', () => ({
  useFeatureFlags: () => mockFlagCtx,
}));

vi.mock('react-router-dom', () => ({
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
    <div data-testid="navigate" data-to={to} data-replace={String(!!replace)} />
  ),
  useLocation: () => mockLocation,
}));

vi.mock('../../shared/ComingSoonPlaceholder', () => ({
  ComingSoonPlaceholder: () => <div data-testid="coming-soon">Coming Soon</div>,
}));

import { ProtectedRoute } from '../ProtectedRoute';

function resetMocks() {
  mockAuthCtx.user = null;
  mockAuthCtx.isLoading = false;
  mockFlagCtx.isRouteEnabled = vi.fn().mockReturnValue(true);
  mockFlagCtx.isLoading = false;
  mockLocation.pathname = '/dashboard';
  mockLocation.search = '';
}

describe('ProtectedRoute', () => {
  beforeEach(() => resetMocks());

  it('renders nothing while auth isLoading is true', () => {
    mockAuthCtx.isLoading = true;
    mockAuthCtx.user = null;

    const { container } = render(
      <ProtectedRoute><div data-testid="child">Protected Content</div></ProtectedRoute>,
    );

    expect(container.innerHTML).toBe('');
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('redirects to /login?returnTo={currentPath} when not authenticated', () => {
    mockAuthCtx.user = null;
    mockLocation.pathname = '/automations/campaigns';
    mockLocation.search = '';

    render(
      <ProtectedRoute><div>Protected</div></ProtectedRoute>,
    );

    const nav = screen.getByTestId('navigate');
    expect(nav).toHaveAttribute('data-to', '/login?returnTo=%2Fautomations%2Fcampaigns');
    expect(nav).toHaveAttribute('data-replace', 'true');
  });

  it('includes search params in the returnTo value', () => {
    mockAuthCtx.user = null;
    mockLocation.pathname = '/audiences/segments';
    mockLocation.search = '?filter=active';

    render(
      <ProtectedRoute><div>Protected</div></ProtectedRoute>,
    );

    const nav = screen.getByTestId('navigate');
    expect(nav).toHaveAttribute(
      'data-to',
      '/login?returnTo=%2Faudiences%2Fsegments%3Ffilter%3Dactive',
    );
  });

  it('renders ComingSoonPlaceholder when feature flag disables the route', () => {
    mockAuthCtx.user = { id: '1', email: 'a@b.com', displayName: 'Alice', avatarInitials: 'AL' };
    mockFlagCtx.isRouteEnabled = vi.fn().mockReturnValue(false);
    mockLocation.pathname = '/content/forms';

    render(
      <ProtectedRoute><div data-testid="child">Protected</div></ProtectedRoute>,
    );

    expect(screen.getByTestId('coming-soon')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    expect(mockFlagCtx.isRouteEnabled).toHaveBeenCalledWith('/content/forms');
  });

  it('renders children when authenticated and feature flag is enabled', () => {
    mockAuthCtx.user = { id: '1', email: 'a@b.com', displayName: 'Alice', avatarInitials: 'AL' };
    mockFlagCtx.isRouteEnabled = vi.fn().mockReturnValue(true);

    render(
      <ProtectedRoute><div data-testid="child">Protected Content</div></ProtectedRoute>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when no feature flag exists for the route (fail-open)', () => {
    mockAuthCtx.user = { id: '1', email: 'a@b.com', displayName: 'Alice', avatarInitials: 'AL' };
    // isRouteEnabled returns true when no flag targets this route
    mockFlagCtx.isRouteEnabled = vi.fn().mockReturnValue(true);
    mockLocation.pathname = '/some/unknown/route';

    render(
      <ProtectedRoute><div data-testid="child">Content</div></ProtectedRoute>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(mockFlagCtx.isRouteEnabled).toHaveBeenCalledWith('/some/unknown/route');
  });
});
