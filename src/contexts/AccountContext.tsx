import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Account } from '../models/account';
import { useDataLayer } from '../providers/DataLayerProvider';

const MASTER_ACCOUNT_ID = 'acc-master';

interface AccountContextValue {
  accounts: Account[];
  selectedAccountId: string;
  selectedAccount: Account;
  setSelectedAccountId: (id: string) => void;
  filterByAccount: <T extends { accountId: string }>(items: T[]) => T[];
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const { accounts: allAccounts } = useDataLayer();
  const [selectedAccountId, setSelectedAccountIdRaw] = useState<string>(MASTER_ACCOUNT_ID);

  const masterAccount = allAccounts.find((a) => a.id === MASTER_ACCOUNT_ID)!;

  const setSelectedAccountId = useCallback((id: string) => {
    const valid = allAccounts.some((a) => a.id === id);
    setSelectedAccountIdRaw(valid ? id : MASTER_ACCOUNT_ID);
  }, [allAccounts]);

  const selectedAccount = useMemo(
    () => allAccounts.find((a) => a.id === selectedAccountId) ?? masterAccount,
    [selectedAccountId, masterAccount, allAccounts],
  );

  const filterByAccount = useCallback(
    <T extends { accountId: string }>(items: T[]): T[] => {
      if (selectedAccountId === MASTER_ACCOUNT_ID) return items;
      return items.filter((item) => item.accountId === selectedAccountId);
    },
    [selectedAccountId],
  );

  const value = useMemo<AccountContextValue>(
    () => ({
      accounts: allAccounts,
      selectedAccountId,
      selectedAccount,
      setSelectedAccountId,
      filterByAccount,
    }),
    [allAccounts, selectedAccountId, selectedAccount, setSelectedAccountId, filterByAccount],
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
