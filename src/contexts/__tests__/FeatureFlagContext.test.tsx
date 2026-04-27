import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Hoisted mock state (runs before any imports) ---
const { mockState, mockFrom } = vi.hoisted(() => {
  const state = {
    configured: true,
    fetchResult: null as { data: unknown[] | null; error: unknown } | null,
    fetchThrows: false,
  };

  const select = vi.fn().mockImplementation(() => {
    if (state.fetchThrows) {
      return Promise.reject(new Error('network error'));
    }
    return Promise.resolve(
      state.fetchResult ?? { data: [], error: null },
    );
  });

  const from = vi.fn().mockReturnValue({ select });

  return { mockState: state, mockFrom: from, mockSelect: select };
});

vi.mock('../../lib/supabase', () => ({
  get supabase() {
    return mockState.configured ? { from: mockFrom } : null;
  },
  isSupabaseConfigured: () => mockState.configured,
}));

import {
  FeatureFlagProvider,
  useFeatureFlags,
} from '../FeatureFlagContext';
import type { FeatureFlagContextValue } from '../FeatureFlagContext';

// Helper component that exposes context values for testing
function TestConsumer({ flagName, routePath }: { flagName?: string; routePath?: string }) {
  const ctx = useFeatureFlags();
  return (
    <div>
      <span data-testid="is-loading">{String(ctx.isLoading)}</span>
      <span data-testid="flag-count">{Object.keys(ctx.flags).length}</span>
      {flagName && (
        <span data-testid="is-enabled">{String(ctx.isEnabled(flagName))}</span>
      )}
      {routePath && (
        <span data-testid="is-route-enabled">{String(ctx.isRouteEnabled(routePath))}</span>
      )}
    </div>
  );
}

// Helper to capture context value via ref
let capturedCtx: FeatureFlagContextValue | null = null;
function CtxCapture() {
  capturedCtx = useFeatureFlags();
  return null;
}

function renderProvider(props?: { flagName?: string; routePath?: string }) {
  return render(
    <FeatureFlagProvider>
      <TestConsumer flagName={props?.flagName} routePath={props?.routePath} />
    </FeatureFlagProvider>,
  );
}

function resetMocks() {
  mockState.configured = true;
  mockState.fetchResult = null;
  mockState.fetchThrows = false;
  capturedCtx = null;
  vi.clearAllMocks();
}

const sampleFlags = [
  { name: 'campaigns', enabled: true, description: 'Campaigns page', scope: 'page', target: '/automations/campaigns' },
  { name: 'forms', enabled: false, description: 'Forms page', scope: 'page', target: '/content/forms' },
  { name: 'inline-editor', enabled: true, description: 'Inline editor', scope: 'component', target: 'inline-editor' },
  { name: 'sms-templates', enabled: false, description: 'SMS templates', scope: 'component', target: 'sms-templates' },
];

describe('FeatureFlagContext', () => {
  beforeEach(() => resetMocks());

  describe('Flag resolution (isEnabled)', () => {
    it('returns true for enabled flags', async () => {
      mockState.fetchResult = { data: sampleFlags, error: null };
      renderProvider({ flagName: 'campaigns' });

      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('is-enabled').textContent).toBe('true');
    });

    it('returns false for disabled flags', async () => {
      mockState.fetchResult = { data: sampleFlags, error: null };
      renderProvider({ flagName: 'forms' });

      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('is-enabled').textContent).toBe('false');
    });

    it('returns true for unknown flags (fail-open)', async () => {
      mockState.fetchResult = { data: sampleFlags, error: null };
      renderProvider({ flagName: 'nonexistent-flag' });

      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('is-enabled').textContent).toBe('true');
    });
  });

  describe('Route resolution (isRouteEnabled)', () => {
    it('returns true when no flag targets the route', async () => {
      mockState.fetchResult = { data: sampleFlags, error: null };
      renderProvider({ routePath: '/dashboard' });

      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('is-route-enabled').textContent).toBe('true');
    });

    it('returns false when a disabled page-scoped flag targets the route', async () => {
      mockState.fetchResult = { data: sampleFlags, error: null };
      renderProvider({ routePath: '/content/forms' });

      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('is-route-enabled').textContent).toBe('false');
    });

    it('returns true when an enabled page-scoped flag targets the route', async () => {
      mockState.fetchResult = { data: sampleFlags, error: null };
      renderProvider({ routePath: '/automations/campaigns' });

      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('is-route-enabled').textContent).toBe('true');
    });

    it('ignores component-scoped flags when checking routes', async () => {
      // 'sms-templates' is disabled but scope=component, so it should not affect route checks
      mockState.fetchResult = { data: sampleFlags, error: null };
      renderProvider({ routePath: 'sms-templates' });

      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('is-route-enabled').textContent).toBe('true');
    });
  });

  describe('Fail-open: Supabase fetch fails', () => {
    it('treats all flags as enabled when fetch returns an error', async () => {
      mockState.fetchResult = { data: null, error: { message: 'table not found' } };

      render(
        <FeatureFlagProvider>
          <CtxCapture />
        </FeatureFlagProvider>,
      );

      await waitFor(() => {
        expect(capturedCtx?.isLoading).toBe(false);
      });

      // Fail-open: no flags loaded, so everything is enabled
      expect(capturedCtx!.isEnabled('anything')).toBe(true);
      expect(capturedCtx!.isRouteEnabled('/any/route')).toBe(true);
      expect(Object.keys(capturedCtx!.flags)).toHaveLength(0);
    });

    it('treats all flags as enabled when fetch throws a network error', async () => {
      mockState.fetchThrows = true;

      render(
        <FeatureFlagProvider>
          <CtxCapture />
        </FeatureFlagProvider>,
      );

      await waitFor(() => {
        expect(capturedCtx?.isLoading).toBe(false);
      });

      expect(capturedCtx!.isEnabled('anything')).toBe(true);
      expect(capturedCtx!.isRouteEnabled('/any/route')).toBe(true);
    });
  });

  describe('Fail-open: Supabase not configured', () => {
    beforeEach(() => {
      mockState.configured = false;
    });

    it('returns fail-open defaults immediately with isLoading=false', () => {
      renderProvider({ flagName: 'any-flag', routePath: '/any/route' });

      // No async wait needed — should be immediate
      expect(screen.getByTestId('is-loading').textContent).toBe('false');
      expect(screen.getByTestId('is-enabled').textContent).toBe('true');
      expect(screen.getByTestId('is-route-enabled').textContent).toBe('true');
    });

    it('does not call Supabase when not configured', () => {
      renderProvider();

      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  describe('useFeatureFlags hook', () => {
    it('throws when used outside FeatureFlagProvider', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<TestConsumer />)).toThrow(
        'useFeatureFlags must be used within a FeatureFlagProvider',
      );
      spy.mockRestore();
    });
  });
});
