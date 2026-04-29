import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { Account } from '../models/account';
import type {
  FunctionalPermissions,
  PermissionGroup,
  PermissionUser,
  UserAccountAssignment,
} from '../models/permissions';
import { FUNCTIONAL_GROUPS } from '../data/permissions';
import { isSupabaseConfigured } from '../lib/supabase';
import { useDataLayer } from '../providers/DataLayerProvider';
import { useToast } from '../components/shared/Toast';
import * as permissionsAdapter from '../lib/adapters/permissions-adapter';
import { useAccount } from './AccountContext';
import { useAuth } from './AuthContext';
import { resolveEffectivePermissions } from '../lib/account-utils';

const STORAGE_KEY = 'ubiquity-permissions';

interface PersistedState {
  permissionGroups: PermissionGroup[];
  assignments: UserAccountAssignment[];
}

export interface PermissionsContextValue {
  // Permission Groups
  permissionGroups: PermissionGroup[];
  addPermissionGroup: (group: PermissionGroup) => void;
  updatePermissionGroup: (id: string, updates: Partial<PermissionGroup>) => void;
  deletePermissionGroup: (id: string) => void;

  // Users
  users: PermissionUser[];

  // Assignments
  assignments: UserAccountAssignment[];
  setAssignmentsForUser: (userId: string, assignments: UserAccountAssignment[]) => void;
  setAssignmentForUserAccount: (
    userId: string,
    accountId: string,
    groupId: string | null,
    customPermissions: Record<string, FunctionalPermissions> | null,
  ) => void;
  removeAssignment: (userId: string, accountId: string) => void;
  getAssignmentsForUser: (userId: string) => UserAccountAssignment[];
  getAssignmentsForAccount: (accountId: string) => UserAccountAssignment[];

  // Account hierarchy helpers
  getChildAccounts: (parentId: string) => Account[];
  getAllDescendantIds: (parentId: string) => string[];
  getRootAccounts: () => Account[];

  // Utility
  resolveGroupName: (assignment: UserAccountAssignment) => string;
  matchPermissionsToGroup: (permissions: Record<string, FunctionalPermissions>) => string | null;

  // Effective permissions for the active root account tree
  effectivePermissions: Record<string, FunctionalPermissions>;
}

function persistState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (Array.isArray(parsed.permissionGroups) && Array.isArray(parsed.assignments)) {
        return parsed;
      }
    }
  } catch {
    // Fall back to DataLayerProvider data
  }
  return null;
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const dataLayer = useDataLayer();
  const { showToast } = useToast();
  const supabaseMode = isSupabaseConfigured();
  const allAccounts = dataLayer.accounts;
  const { user } = useAuth();
  const { activeRootAccountId, accountsInActiveTree } = useAccount();

  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(() => {
    if (!supabaseMode) {
      const stored = loadPersistedState();
      if (stored) return stored.permissionGroups;
    }
    return dataLayer.permissionGroups;
  });
  const [assignments, setAssignments] = useState<UserAccountAssignment[]>(() => {
    if (!supabaseMode) {
      const stored = loadPersistedState();
      if (stored) return stored.assignments;
    }
    return dataLayer.assignments;
  });
  const permissionUsers = dataLayer.users;

  // Persist to localStorage only in local mode
  useEffect(() => {
    if (!supabaseMode) {
      persistState({ permissionGroups, assignments });
    }
  }, [permissionGroups, assignments, supabaseMode]);

  // --- Permission Group CRUD ---

  const addPermissionGroup = useCallback((group: PermissionGroup) => {
    setPermissionGroups((prev) => [...prev, group]);
    if (supabaseMode) {
      permissionsAdapter.addPermissionGroup(group).catch((err) => {
        showToast(err.message || 'Failed to add permission group', 'error');
        setPermissionGroups((prev) => prev.filter((g) => g.id !== group.id));
      });
    }
  }, [supabaseMode, showToast]);

  const updatePermissionGroup = useCallback(
    (id: string, updates: Partial<PermissionGroup>) => {
      setPermissionGroups((prev) => {
        const updated = prev.map((g) => (g.id === id ? { ...g, ...updates } : g));
        if (supabaseMode) {
          permissionsAdapter.updatePermissionGroup(id, updates).catch((err) => {
            showToast(err.message || 'Failed to update permission group', 'error');
            setPermissionGroups(prev);
          });
        }
        return updated;
      });
      // Propagate permission changes to assignments (same logic as before)
      if (updates.permissions) {
        setAssignments((prev) =>
          prev.map((a) => {
            if (a.permissionGroupId === id && a.customPermissions === null) {
              return a;
            }
            return a;
          }),
        );
      }
    },
    [supabaseMode, showToast],
  );

  const deletePermissionGroup = useCallback(
    (id: string) => {
      const groupToDelete = permissionGroups.find((g) => g.id === id);
      if (!groupToDelete) return;

      setPermissionGroups((prev) => prev.filter((g) => g.id !== id));
      setAssignments((prev) =>
        prev.map((a) => {
          if (a.permissionGroupId === id) {
            return {
              ...a,
              permissionGroupId: null,
              customPermissions: { ...groupToDelete.permissions },
            };
          }
          return a;
        }),
      );

      if (supabaseMode) {
        permissionsAdapter.deletePermissionGroup(id).catch((err) => {
          showToast(err.message || 'Failed to delete permission group', 'error');
        });
      }
    },
    [permissionGroups, supabaseMode, showToast],
  );

  // --- Assignment CRUD ---

  const setAssignmentsForUser = useCallback(
    (userId: string, newAssignments: UserAccountAssignment[]) => {
      setAssignments((prev) => [
        ...prev.filter((a) => a.userId !== userId),
        ...newAssignments,
      ]);
      if (supabaseMode) {
        permissionsAdapter.setAssignmentsForUser(userId, newAssignments).catch((err) => {
          showToast(err.message || 'Failed to update assignments', 'error');
        });
      }
    },
    [supabaseMode, showToast],
  );

  const setAssignmentForUserAccount = useCallback(
    (
      userId: string,
      accountId: string,
      groupId: string | null,
      customPermissions: Record<string, FunctionalPermissions> | null,
    ) => {
      setAssignments((prev) => {
        const existing = prev.findIndex(
          (a) => a.userId === userId && a.accountId === accountId,
        );
        const newAssignment: UserAccountAssignment = {
          userId,
          accountId,
          permissionGroupId: groupId,
          customPermissions,
        };
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = newAssignment;
          return updated;
        }
        return [...prev, newAssignment];
      });
      if (supabaseMode) {
        permissionsAdapter.setAssignmentForUserAccount(userId, accountId, groupId, customPermissions).catch((err) => {
          showToast(err.message || 'Failed to update assignment', 'error');
        });
      }
    },
    [supabaseMode, showToast],
  );

  const removeAssignment = useCallback((userId: string, accountId: string) => {
    setAssignments((prev) =>
      prev.filter((a) => !(a.userId === userId && a.accountId === accountId)),
    );
    if (supabaseMode) {
      permissionsAdapter.removeAssignment(userId, accountId).catch((err) => {
        showToast(err.message || 'Failed to remove assignment', 'error');
      });
    }
  }, [supabaseMode, showToast]);

  const getAssignmentsForUser = useCallback(
    (userId: string): UserAccountAssignment[] => {
      return assignments.filter((a) => a.userId === userId);
    },
    [assignments],
  );

  const getAssignmentsForAccount = useCallback(
    (accountId: string): UserAccountAssignment[] => {
      return assignments.filter((a) => a.accountId === accountId);
    },
    [assignments],
  );

  // --- Account hierarchy helpers ---

  const getRootAccounts = useCallback((): Account[] => {
    return allAccounts.filter((a) => a.parentId === null);
  }, [allAccounts]);

  const getChildAccounts = useCallback((parentId: string): Account[] => {
    return allAccounts.filter((a) => a.parentId === parentId);
  }, [allAccounts]);

  const getAllDescendantIds = useCallback((parentId: string): string[] => {
    const result: string[] = [];
    const collect = (id: string) => {
      const children = allAccounts.filter((a) => a.parentId === id);
      for (const child of children) {
        result.push(child.id);
        collect(child.id);
      }
    };
    collect(parentId);
    return result;
  }, [allAccounts]);

  // --- Utilities ---

  const matchPermissionsToGroup = useCallback(
    (permissions: Record<string, FunctionalPermissions>): string | null => {
      for (const group of permissionGroups) {
        const match = FUNCTIONAL_GROUPS.every((fg) => {
          const custom = permissions[fg];
          const groupPerm = group.permissions[fg];
          if (!custom || !groupPerm) return false;
          return (
            custom.create === groupPerm.create &&
            custom.read === groupPerm.read &&
            custom.update === groupPerm.update &&
            custom.delete === groupPerm.delete
          );
        });
        if (match) return group.id;
      }
      return null;
    },
    [permissionGroups],
  );

  const resolveGroupName = useCallback(
    (assignment: UserAccountAssignment): string => {
      if (assignment.permissionGroupId) {
        const group = permissionGroups.find((g) => g.id === assignment.permissionGroupId);
        return group ? group.name : 'Custom';
      }
      if (assignment.customPermissions) {
        const matchedId = matchPermissionsToGroup(assignment.customPermissions);
        if (matchedId) {
          const group = permissionGroups.find((g) => g.id === matchedId);
          return group ? group.name : 'Custom';
        }
      }
      return 'Custom';
    },
    [permissionGroups, matchPermissionsToGroup],
  );

  // --- Effective permissions for active root account tree ---

  const effectivePermissions = useMemo<Record<string, FunctionalPermissions>>(() => {
    const userId = user?.id ?? '';
    if (!userId) return {};

    const accountTreeIds = accountsInActiveTree.map((a) => a.id);
    return resolveEffectivePermissions(assignments, permissionGroups, accountTreeIds, userId);
  }, [user?.id, accountsInActiveTree, assignments, permissionGroups]);

  const value: PermissionsContextValue = {
    permissionGroups,
    addPermissionGroup,
    updatePermissionGroup,
    deletePermissionGroup,
    users: permissionUsers,
    assignments,
    setAssignmentsForUser,
    setAssignmentForUserAccount,
    removeAssignment,
    getAssignmentsForUser,
    getAssignmentsForAccount,
    getChildAccounts,
    getAllDescendantIds,
    getRootAccounts,
    resolveGroupName,
    matchPermissionsToGroup,
    effectivePermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextValue {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

export { PermissionsContext };
