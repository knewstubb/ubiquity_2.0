import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { FunctionalPermissions } from '../models/permissions';
import type { SimulatedRole } from '../lib/session-store';
import { saveSession, loadSession } from '../lib/session-store';
import { useAuth } from './AuthContext';

// ── Persona CRUD matrices ──

const CRUD: FunctionalPermissions = { create: true, read: true, update: true, delete: true };
const CR_ONLY: FunctionalPermissions = { create: true, read: true, update: false, delete: false };
const R_ONLY: FunctionalPermissions = { create: false, read: true, update: false, delete: false };
const NONE: FunctionalPermissions = { create: false, read: false, update: false, delete: false };

export const ROLE_PERMISSIONS: Record<SimulatedRole, Record<string, FunctionalPermissions>> = {
  admin: {
    Dashboard: CRUD,
    Audiences: CRUD,
    Campaigns: CRUD,
    Content: CRUD,
    Analytics: CRUD,
    Settings: CRUD,
  },
  marketer: {
    Dashboard: CRUD,
    Audiences: CR_ONLY,
    Campaigns: CRUD,
    Content: CRUD,
    Analytics: R_ONLY,
    Settings: NONE,
  },
  viewer: {
    Dashboard: R_ONLY,
    Audiences: R_ONLY,
    Campaigns: NONE,
    Content: NONE,
    Analytics: R_ONLY,
    Settings: NONE,
  },
};

export interface RoleSimulatorContextValue {
  activeRole: SimulatedRole;
  setRole: (role: SimulatedRole) => void;
  permissions: Record<string, FunctionalPermissions>;
}

const RoleSimulatorContext = createContext<RoleSimulatorContextValue | undefined>(undefined);

export function RoleSimulatorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [activeRole, setActiveRole] = useState<SimulatedRole>(() => {
    if (!userId) return 'admin';
    const session = loadSession(userId);
    return session?.simulatedRole ?? 'admin';
  });

  // Re-load role when user changes
  useEffect(() => {
    if (!userId) return;
    const session = loadSession(userId);
    setActiveRole(session?.simulatedRole ?? 'admin');
  }, [userId]);

  const setRole = useCallback(
    (role: SimulatedRole) => {
      setActiveRole(role);
      if (userId) {
        saveSession(userId, { simulatedRole: role });
      }
    },
    [userId],
  );

  const permissions = useMemo(() => ROLE_PERMISSIONS[activeRole], [activeRole]);

  const value = useMemo<RoleSimulatorContextValue>(
    () => ({ activeRole, setRole, permissions }),
    [activeRole, setRole, permissions],
  );

  return (
    <RoleSimulatorContext.Provider value={value}>
      {children}
    </RoleSimulatorContext.Provider>
  );
}

export function useRoleSimulator(): RoleSimulatorContextValue {
  const context = useContext(RoleSimulatorContext);
  if (!context) {
    throw new Error('useRoleSimulator must be used within a RoleSimulatorProvider');
  }
  return context;
}

export { RoleSimulatorContext };
