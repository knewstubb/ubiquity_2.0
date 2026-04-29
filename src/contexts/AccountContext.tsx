import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import type { Account } from '../models/account';
import { useDataLayer } from '../providers/DataLayerProvider';
import { useAuth } from './AuthContext';
import { usePlatformAdmin } from './PlatformAdminContext';
import { resolveAccessibleRoots, getAccountTree } from '../lib/account-utils';
import { saveSession, loadSession } from '../lib/session-store';

export type AccessPattern = 'single-account' | 'multi-account' | 'platform-admin';

interface AccountContextValue {
  // Existing (preserved)
  accounts: Account[];
  selectedAccountId: string;
  selectedAccount: Account;
  setSelectedAccountId: (id: string) => void;
  filterByAccount: <T extends { accountId: string }>(items: T[]) => T[];

  // New
  accessPattern: AccessPattern;
  accessibleRootAccounts: Account[];
  activeRootAccountId: string | null;
  activeRootAccount: Account | null;
  setActiveRootAccountId: (id: string | null) => void;
  isAllAccountsMode: boolean;
  accountsInActiveTree: Account[];
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

/**
 * Resolves the initial activeRootAccountId on mount:
 * 1. Try restoring from session store
 * 2. If stored value is '__all__' (null) and user is platform admin, use null
 * 3. If stored root is no longer accessible, fall back to first accessible root
 * 4. Default to first accessible root (or null for platform admin with no stored value)
 */
function resolveInitialRootId(
  userId: string,
  accessibleRoots: Account[],
  isPlatformAdmin: boolean,
): string | null {
  const session = loadSession(userId);
  const storedRootId = session?.selectedRootAccountId;

  if (storedRootId === null && isPlatformAdmin) {
    // All Accounts Mode was stored
    return null;
  }

  if (storedRootId != null) {
    // Validate stored root is still accessible
    const isAccessible = accessibleRoots.some((r) => r.id === storedRootId);
    if (isAccessible) return storedRootId;
    // Fallback: stored root no longer accessible
    console.warn('session-store: stored root account no longer accessible, falling back');
  }

  // Default: first accessible root
  return accessibleRoots.length > 0 ? accessibleRoots[0].id : null;
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const { accounts: allAccounts, assignments } = useDataLayer();
  const { user } = useAuth();
  const { isPlatformAdmin } = usePlatformAdmin();
  const userId = user?.id ?? '';

  // --- Resolve accessible root accounts ---
  const accessibleRootAccounts = useMemo<Account[]>(() => {
    if (isPlatformAdmin) {
      // Platform admins see all root accounts
      return allAccounts.filter((a) => a.parentId === null);
    }
    return resolveAccessibleRoots(assignments, allAccounts, userId);
  }, [isPlatformAdmin, assignments, allAccounts, userId]);

  // --- Determine access pattern ---
  const accessPattern = useMemo<AccessPattern>(() => {
    if (isPlatformAdmin) return 'platform-admin';
    if (accessibleRootAccounts.length > 1) return 'multi-account';
    return 'single-account';
  }, [isPlatformAdmin, accessibleRootAccounts.length]);

  // --- Active root account state with session persistence ---
  const [activeRootAccountId, setActiveRootAccountIdRaw] = useState<string | null>(() =>
    resolveInitialRootId(userId, accessibleRootAccounts, isPlatformAdmin),
  );

  // Derived values
  const isAllAccountsMode = activeRootAccountId === null;

  const activeRootAccount = useMemo<Account | null>(
    () => (activeRootAccountId ? allAccounts.find((a) => a.id === activeRootAccountId) ?? null : null),
    [activeRootAccountId, allAccounts],
  );

  // --- Accounts in active tree ---
  const accountsInActiveTree = useMemo<Account[]>(() => {
    if (isAllAccountsMode) return allAccounts;
    if (!activeRootAccountId) return allAccounts;
    return getAccountTree(activeRootAccountId, allAccounts);
  }, [isAllAccountsMode, activeRootAccountId, allAccounts]);

  // --- Selected account (child-level) state ---
  const [selectedAccountId, setSelectedAccountIdRaw] = useState<string>(() => {
    return activeRootAccountId ?? (accessibleRootAccounts[0]?.id ?? '');
  });

  const selectedAccount = useMemo<Account>(
    () =>
      allAccounts.find((a) => a.id === selectedAccountId) ??
      allAccounts.find((a) => a.id === activeRootAccountId) ??
      allAccounts[0],
    [selectedAccountId, activeRootAccountId, allAccounts],
  );

  // --- setActiveRootAccountId: persist + reset selectedAccountId ---
  const setActiveRootAccountId = useCallback(
    (id: string | null) => {
      // Only platform admins can enter All Accounts Mode
      if (id === null && !isPlatformAdmin) return;

      setActiveRootAccountIdRaw(id);

      // Reset selectedAccountId to the new root (or first root if All Accounts)
      if (id !== null) {
        setSelectedAccountIdRaw(id);
      }

      // Persist to session store
      if (userId) {
        saveSession(userId, { selectedRootAccountId: id });
      }
    },
    [isPlatformAdmin, userId],
  );

  // --- setSelectedAccountId (preserved behaviour) ---
  const setSelectedAccountId = useCallback(
    (id: string) => {
      const valid = allAccounts.some((a) => a.id === id);
      const fallbackId = activeRootAccountId ?? accessibleRootAccounts[0]?.id ?? '';
      setSelectedAccountIdRaw(valid ? id : fallbackId);
    },
    [allAccounts, activeRootAccountId, accessibleRootAccounts],
  );

  // --- filterByAccount (updated for All Accounts Mode) ---
  const filterByAccount = useCallback(
    <T extends { accountId: string }>(items: T[]): T[] => {
      if (isAllAccountsMode) return items;
      if (selectedAccountId === activeRootAccountId) return items.filter((item) => accountsInActiveTree.some((a) => a.id === item.accountId));
      return items.filter((item) => item.accountId === selectedAccountId);
    },
    [isAllAccountsMode, selectedAccountId, activeRootAccountId, accountsInActiveTree],
  );

  // --- Persist activeRootAccountId on change (also handles initial mount) ---
  useEffect(() => {
    if (userId) {
      saveSession(userId, { selectedRootAccountId: activeRootAccountId });
    }
  }, [activeRootAccountId, userId]);

  // --- Fallback: if accessible roots change and current root is no longer valid ---
  useEffect(() => {
    if (activeRootAccountId === null) return; // All Accounts Mode is always valid for admins
    const stillAccessible = accessibleRootAccounts.some((r) => r.id === activeRootAccountId);
    if (!stillAccessible && accessibleRootAccounts.length > 0) {
      console.warn('AccountContext: active root no longer accessible, falling back');
      const fallback = accessibleRootAccounts[0].id;
      setActiveRootAccountIdRaw(fallback);
      setSelectedAccountIdRaw(fallback);
    }
  }, [activeRootAccountId, accessibleRootAccounts]);

  const value = useMemo<AccountContextValue>(
    () => ({
      accounts: allAccounts,
      selectedAccountId,
      selectedAccount,
      setSelectedAccountId,
      filterByAccount,
      accessPattern,
      accessibleRootAccounts,
      activeRootAccountId,
      activeRootAccount,
      setActiveRootAccountId,
      isAllAccountsMode,
      accountsInActiveTree,
    }),
    [
      allAccounts,
      selectedAccountId,
      selectedAccount,
      setSelectedAccountId,
      filterByAccount,
      accessPattern,
      accessibleRootAccounts,
      activeRootAccountId,
      activeRootAccount,
      setActiveRootAccountId,
      isAllAccountsMode,
      accountsInActiveTree,
    ],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextValue {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}
