import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';

/**
 * Platform admin emails — users whose email matches (case-insensitive)
 * get system-level access to all root accounts and admin-only features.
 * Separate from ADMIN_BYPASS_EMAILS in FeatureFlagContext (different concern).
 */
const PLATFORM_ADMIN_EMAILS: string[] = [
  'knewstubb@gmail.com',
  'local@ubiquity.dev', // local mode mock user
];

export interface PlatformAdminContextValue {
  isPlatformAdmin: boolean;
}

const PlatformAdminContext = createContext<PlatformAdminContextValue | undefined>(undefined);

export function PlatformAdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const isPlatformAdmin = useMemo(() => {
    if (!user?.email || PLATFORM_ADMIN_EMAILS.length === 0) return false;
    const normalised = user.email.toLowerCase();
    return PLATFORM_ADMIN_EMAILS.some(
      (adminEmail) => adminEmail.toLowerCase() === normalised,
    );
  }, [user?.email]);

  const value = useMemo<PlatformAdminContextValue>(
    () => ({ isPlatformAdmin }),
    [isPlatformAdmin],
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
