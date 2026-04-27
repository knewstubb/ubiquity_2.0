import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { arbFeatureFlag } from '../generators';
import type { FeatureFlag } from '../../contexts/FeatureFlagContext';

/**
 * Property 4: Disabled feature flags hide navigation and show placeholder
 *
 * For any feature flag with scope 'page':
 * - When disabled, ProtectedRoute renders ComingSoonPlaceholder for that route
 * - When enabled, ProtectedRoute renders children for that route
 *
 * **Validates: Requirements 3.3**
 */

// --- Hoisted mock state ---
const { mockAuthCtx, mockFlagCtx, mockLocation } = vi.hoisted(() => {
  const authCtx = {
    user: { id: 'u1', email: 'test@example.com', displayName: 'Test User', avatarInitials: 'TU' },
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

/**
 * Helper: given a flag config, determine if isRouteEnabled should return
 * false for a given route. A route is disabled when any page-scoped flag
 * with a matching target is disabled.
 */
function isRouteDisabledByFlags(flags: FeatureFlag[], route: string): boolean {
  return flags.some((f) => f.scope === 'page' && f.target === route && !f.enabled);
}

describe('Property 4: Disabled feature flags hide navigation and show placeholder', () => {
  /**
   * **Validates: Requirements 3.3**
   *
   * When a page-scoped flag is disabled, ProtectedRoute renders
   * ComingSoonPlaceholder for that route instead of children.
   */
  it('renders ComingSoonPlaceholder when a page-scoped flag is disabled for the route', () => {
    // Generate page-scoped, disabled flags with route targets
    const arbDisabledPageFlag = arbFeatureFlag().map((f) => ({
      ...f,
      scope: 'page' as const,
      enabled: false,
    }));

    fc.assert(
      fc.property(arbDisabledPageFlag, (flag) => {
        // Only test flags whose target is a route (starts with '/')
        fc.pre(flag.target.startsWith('/'));

        mockLocation.pathname = flag.target;
        mockLocation.search = '';
        mockFlagCtx.isRouteEnabled = vi.fn().mockReturnValue(false);

        const { unmount } = render(
          <ProtectedRoute>
            <div data-testid="child">Protected Content</div>
          </ProtectedRoute>,
        );

        // Should show placeholder, not children
        expect(screen.getByTestId('coming-soon')).toBeInTheDocument();
        expect(screen.queryByTestId('child')).not.toBeInTheDocument();

        // isRouteEnabled should have been called with the flag's target route
        expect(mockFlagCtx.isRouteEnabled).toHaveBeenCalledWith(flag.target);

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 3.3**
   *
   * When a page-scoped flag is enabled, ProtectedRoute renders children
   * for that route.
   */
  it('renders children when a page-scoped flag is enabled for the route', () => {
    const arbEnabledPageFlag = arbFeatureFlag().map((f) => ({
      ...f,
      scope: 'page' as const,
      enabled: true,
    }));

    fc.assert(
      fc.property(arbEnabledPageFlag, (flag) => {
        // Only test flags whose target is a route (starts with '/')
        fc.pre(flag.target.startsWith('/'));

        mockLocation.pathname = flag.target;
        mockLocation.search = '';
        mockFlagCtx.isRouteEnabled = vi.fn().mockReturnValue(true);

        const { unmount } = render(
          <ProtectedRoute>
            <div data-testid="child">Protected Content</div>
          </ProtectedRoute>,
        );

        // Should show children, not placeholder
        expect(screen.getByTestId('child')).toBeInTheDocument();
        expect(screen.queryByTestId('coming-soon')).not.toBeInTheDocument();

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
