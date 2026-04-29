import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';

/**
 * Role hierarchy (highest to lowest):
 *
 * 1. super-admin     — You. Bypasses feature flags, sees everything.
 * 2. platform-admin  — @spark.co.nz users. Sees all root accounts, feature flags apply.
 * 3. account-admin   — Has admin access within their assigned root account(s).
 * 4. editor          — Can create/edit content but no admin section.
 * 5. viewer          — Read-only access.
 */
export type UserRole = 'super-admin' | 'platform-admin' | 'account-admin' | 'editor' | 'viewer';

/** Super admin emails — bypass everything including feature flags */
const SUPER_ADMIN_EMAILS: string[] = [
  'knewstubb@gmail.com',
  'local@ubiquity.dev', // local mode mock user
];

/** Platform admin email domains — see all accounts, feature flags apply */
const PLATFORM_ADMIN_DOMAINS: string[] = [
  'spark.co.nz',
];

export interface PlatformAdminContextValue {
  /** The resolved role for the current user */
  role: UserRole;
  /** Convenience: true for super-admin and platform-admin */
  isPlatformAdmin: boolean;
  /** Convenience: true only for super-admin (bypasses feature flags) */
  isSuperAdmin: boolean;
  /** True if user can see admin pages (super-admin, platform-admin, account-admin) */
  canAccessAdmin: boolean;
  /** True if user can create/edit content (everyone except viewer) */
  canEdit: boolean;
}

const PlatformAdminContext = createContext<PlatformAdminContextValue | undefined>(undefined);

function resolveRole(email: string | undefined): UserRole {
  if (!email) return 'viewer';
  const normalised = email.toLowerCase();

  // Super admin — exact email match
  if (SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === normalised)) {
    return 'super-admin';
  }

  // Platform admin — domain match
  const domain = normalised.split('@')[1];
  if (domain && PLATFORM_ADMIN_DOMAINS.some((d) => d.toLowerCase() === domain)) {
    return 'platform-admin';
  }

  // Default for prototype: account-admin (all demo users get admin within their accounts)
  // In production this would come from the user_account_assignments table
  return 'account-admin';
}

export function PlatformAdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const role = useMemo(() => resolveRole(user?.email), [user?.email]);

  const value = useMemo<PlatformAdminContextValue>(
    () => ({
      role,
      isPlatformAdmin: role === 'super-admin' || role === 'platform-admin',
      isSuperAdmin: role === 'super-admin',
      canAccessAdmin: role === 'super-admin' || role === 'platform-admin' || role === 'account-admin',
      canEdit: role !== 'viewer',
    }),
    [role],
  );

  return (
    <PlatformAdminContext.Provider value={value}>
      {children}
    </PlatformAdminContext.Provider>
  );
}

export function usePlatformAdmin(): PlatformAdminContextValue {
  const context = useContext(PlatformAdminContext);
  if (!context) {
    throw new Error('usePlatformAdmin must be used within a PlatformAdminProvider');
  }
  return context;
}
