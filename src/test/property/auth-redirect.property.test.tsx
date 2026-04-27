import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';

/**
 * Property 3: Unauthenticated users are redirected to login
 *
 * For any protected route path, when the user is not authenticated
 * (user=null, isLoading=false) and the route is enabled by feature flags,
 * ProtectedRoute renders a Navigate component to `/login?returnTo={encodedRoute}`.
 *
 * **Validates: Requirements 2.2**
 */

// --- Hoisted mock state ---
const { mockAuthCtx, mockFlagCtx, mockLocation } = vi.hoisted(() => {
  const authCtx = {
    user: null as null,
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

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthCtx,
}));

vi.mock('../../contexts/FeatureFlagContext', () => ({
  useFeatureFlags: () => mockFlagCtx,
}));

vi.mock('react-router-dom', () => ({
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
    <div data-testid="navigate" data-to={to} data-replace={String(!!replace)} />
  ),
  useLocation: () => mockLocation,
}));

vi.mock('../../components/shared/ComingSoonPlaceholder', () => ({
  ComingSoonPlaceholder: () => <div data-testid="coming-soon">Coming Soon</div>,
}));

import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

// --- Generator for valid route paths ---

/** Generates route path segments using lowercase alphanumeric + hyphens */
function arbRouteSegment(): fc.Arbitrary<string> {
  return fc
    .array(
      fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-_'.split('')),
      { minLength: 1, maxLength: 20 },
    )
    .map((chars) => chars.join(''));
}

/** Generates a route path like /segment1/segment2 with 1-4 segments */
function arbRoutePath(): fc.Arbitrary<string> {
  return fc
    .array(arbRouteSegment(), { minLength: 1, maxLength: 4 })
    .map((segments) => '/' + segments.join('/'));
}

/** Generates an optional query string like ?key=value */
function arbQueryString(): fc.Arbitrary<string> {
  return fc.oneof(
    fc.constant(''),
    fc
      .tuple(arbRouteSegment(), arbRouteSegment())
      .map(([k, v]) => `?${k}=${v}`),
  );
}

describe('Property 3: Unauthenticated users are redirected to login', () => {
  /**
   * **Validates: Requirements 2.2**
   *
   * For any route path, when user is null and isLoading is false,
   * ProtectedRoute renders Navigate to /login?returnTo={encodedRoute}.
   */
  it('redirects unauthenticated users to /login?returnTo={encodedRoute} for any route', () => {
    fc.assert(
      fc.property(arbRoutePath(), arbQueryString(), (pathname, search) => {
        // Configure mocks: unauthenticated, route enabled
        mockAuthCtx.user = null;
        mockAuthCtx.isLoading = false;
        mockFlagCtx.isRouteEnabled = vi.fn().mockReturnValue(true);
        mockLocation.pathname = pathname;
        mockLocation.search = search;

        const { unmount } = render(
          <ProtectedRoute>
            <div data-testid="child">Protected</div>
          </ProtectedRoute>,
        );

        // Should render Navigate, not children
        const nav = screen.getByTestId('navigate');
        expect(screen.queryByTestId('child')).not.toBeInTheDocument();

        // Verify redirect target
        const returnTo = pathname + search;
        const expectedTo = `/login?returnTo=${encodeURIComponent(returnTo)}`;
        expect(nav.getAttribute('data-to')).toBe(expectedTo);
        expect(nav.getAttribute('data-replace')).toBe('true');

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
