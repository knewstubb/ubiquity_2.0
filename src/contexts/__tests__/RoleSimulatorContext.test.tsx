import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Hoisted mock state ---
const { mockUser, mockSessionStore } = vi.hoisted(() => {
  const user = {
    current: null as { id: string; email: string; displayName: string; avatarInitials: string } | null,
  };

  const sessionStore = {
    saved: {} as Record<string, Record<string, unknown>>,
    loadReturn: null as Record<string, unknown> | null,
  };

  return { mockUser: user, mockSessionStore: sessionStore };
});

vi.mock('../AuthContext', () => ({
  useAuth: () => ({
    user: mockUser.current,
    isLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock('../../lib/session-store', () => ({
  saveSession: vi.fn((userId: string, state: Record<string, unknown>) => {
    mockSessionStore.saved[userId] = {
      ...(mockSessionStore.saved[userId] ?? {}),
      ...state,
    };
  }),
  loadSession: vi.fn((_userId: string) => mockSessionStore.loadReturn),
}));

import {
  RoleSimulatorProvider,
  useRoleSimulator,
  ROLE_PERMISSIONS,
} from '../RoleSimulatorContext';
import type { RoleSimulatorContextValue } from '../RoleSimulatorContext';
import { saveSession } from '../../lib/session-store';

// Helper to capture context value
let ctx: RoleSimulatorContextValue | null = null;
function CtxCapture() {
  ctx = useRoleSimulator();
  return null;
}

const fakeUser = {
  id: 'user-1',
  email: 'alice@example.com',
  displayName: 'Alice',
  avatarInitials: 'AL',
};

function renderProvider() {
  return render(
    <RoleSimulatorProvider>
      <CtxCapture />
    </RoleSimulatorProvider>,
  );
}

describe('RoleSimulatorContext', () => {
  beforeEach(() => {
    ctx = null;
    mockUser.current = fakeUser;
    mockSessionStore.saved = {};
    mockSessionStore.loadReturn = null;
    vi.clearAllMocks();
  });

  describe('Default role', () => {
    it('defaults to admin when no session exists', () => {
      renderProvider();
      expect(ctx!.activeRole).toBe('admin');
    });

    it('defaults to admin when user is null', () => {
      mockUser.current = null;
      renderProvider();
      expect(ctx!.activeRole).toBe('admin');
    });

    it('restores persisted role from session', () => {
      mockSessionStore.loadReturn = { simulatedRole: 'viewer' };
      renderProvider();
      expect(ctx!.activeRole).toBe('viewer');
    });
  });

  describe('Admin role — full CRUD on all groups', () => {
    it('has CRUD on every functional group', () => {
      renderProvider();
      const perms = ctx!.permissions;

      for (const group of ['Dashboard', 'Audiences', 'Campaigns', 'Content', 'Analytics', 'Settings']) {
        expect(perms[group]).toEqual({
          create: true,
          read: true,
          update: true,
          delete: true,
        });
      }
    });
  });

  describe('Marketer role — correct CRUD matrix', () => {
    it('matches the persona permission table', () => {
      renderProvider();
      act(() => { ctx!.setRole('marketer'); });

      const perms = ctx!.permissions;

      // Dashboard: CRUD
      expect(perms.Dashboard).toEqual({ create: true, read: true, update: true, delete: true });
      // Audiences: CR only
      expect(perms.Audiences).toEqual({ create: true, read: true, update: false, delete: false });
      // Campaigns: CRUD
      expect(perms.Campaigns).toEqual({ create: true, read: true, update: true, delete: true });
      // Content: CRUD
      expect(perms.Content).toEqual({ create: true, read: true, update: true, delete: true });
      // Analytics: R only
      expect(perms.Analytics).toEqual({ create: false, read: true, update: false, delete: false });
      // Settings: NONE
      expect(perms.Settings).toEqual({ create: false, read: false, update: false, delete: false });
    });
  });

  describe('Viewer role — correct CRUD matrix', () => {
    it('matches the persona permission table', () => {
      renderProvider();
      act(() => { ctx!.setRole('viewer'); });

      const perms = ctx!.permissions;

      // Dashboard: R only
      expect(perms.Dashboard).toEqual({ create: false, read: true, update: false, delete: false });
      // Audiences: R only
      expect(perms.Audiences).toEqual({ create: false, read: true, update: false, delete: false });
      // Campaigns: NONE
      expect(perms.Campaigns).toEqual({ create: false, read: false, update: false, delete: false });
      // Content: NONE
      expect(perms.Content).toEqual({ create: false, read: false, update: false, delete: false });
      // Analytics: R only
      expect(perms.Analytics).toEqual({ create: false, read: true, update: false, delete: false });
      // Settings: NONE
      expect(perms.Settings).toEqual({ create: false, read: false, update: false, delete: false });
    });
  });

  describe('setRole updates active role and permissions', () => {
    it('switches from admin to marketer', () => {
      renderProvider();
      expect(ctx!.activeRole).toBe('admin');

      act(() => { ctx!.setRole('marketer'); });

      expect(ctx!.activeRole).toBe('marketer');
      expect(ctx!.permissions).toBe(ROLE_PERMISSIONS.marketer);
    });

    it('switches from marketer to viewer', () => {
      renderProvider();
      act(() => { ctx!.setRole('marketer'); });
      act(() => { ctx!.setRole('viewer'); });

      expect(ctx!.activeRole).toBe('viewer');
      expect(ctx!.permissions).toBe(ROLE_PERMISSIONS.viewer);
    });

    it('switches back to admin', () => {
      renderProvider();
      act(() => { ctx!.setRole('viewer'); });
      act(() => { ctx!.setRole('admin'); });

      expect(ctx!.activeRole).toBe('admin');
      expect(ctx!.permissions).toBe(ROLE_PERMISSIONS.admin);
    });

    it('persists role to session store on change', () => {
      renderProvider();
      act(() => { ctx!.setRole('marketer'); });

      expect(saveSession).toHaveBeenCalledWith('user-1', { simulatedRole: 'marketer' });
    });

    it('does not persist when user is null', () => {
      mockUser.current = null;
      renderProvider();
      act(() => { ctx!.setRole('viewer'); });

      expect(saveSession).not.toHaveBeenCalled();
    });
  });

  describe('Permissions context override', () => {
    it('permissions reference matches ROLE_PERMISSIONS for each role', () => {
      renderProvider();

      expect(ctx!.permissions).toBe(ROLE_PERMISSIONS.admin);

      act(() => { ctx!.setRole('marketer'); });
      expect(ctx!.permissions).toBe(ROLE_PERMISSIONS.marketer);

      act(() => { ctx!.setRole('viewer'); });
      expect(ctx!.permissions).toBe(ROLE_PERMISSIONS.viewer);
    });

    it('ROLE_PERMISSIONS covers all six functional groups for every role', () => {
      const expectedGroups = ['Dashboard', 'Audiences', 'Campaigns', 'Content', 'Analytics', 'Settings'];

      for (const role of ['admin', 'marketer', 'viewer'] as const) {
        const groups = Object.keys(ROLE_PERMISSIONS[role]);
        expect(groups).toEqual(expect.arrayContaining(expectedGroups));
        expect(groups).toHaveLength(expectedGroups.length);
      }
    });
  });

  describe('useRoleSimulator hook', () => {
    it('throws when used outside RoleSimulatorProvider', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<CtxCapture />)).toThrow(
        'useRoleSimulator must be used within a RoleSimulatorProvider',
      );
      spy.mockRestore();
    });
  });
});
