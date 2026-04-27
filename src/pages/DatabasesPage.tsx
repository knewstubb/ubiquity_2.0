import { useState, useMemo } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { TabBar } from '../components/permissions/TabBar';
import { DataTable, type Column } from '../components/shared/DataTable';
import { useAccount } from '../contexts/AccountContext';
import { spaContacts } from '../data/spaContacts';
import { transactionalDatabases, type TransactionalRecord } from '../data/transactionalData';
import { accounts } from '../data/accounts';
import type { Contact } from '../models/contact';
import styles from './DatabasesPage.module.css';

const TIER_CLASS: Record<string, string> = {
  Bronze: 'bronze',
  Silver: 'silver',
  Gold: 'gold',
  Platinum: 'platinum',
};

const accountNameMap = new Map(accounts.map((a) => [a.id, a.name]));

const contactColumns: Column<Contact>[] = [
  { key: 'name', header: 'Name', render: (c) => `${c.firstName} ${c.lastName}` },
  { key: 'email', header: 'Email', render: (c) => c.email },
  {
    key: 'tier',
    header: 'Membership Tier',
    width: '150px',
    render: (c) => (
      <span className={`${styles.tierBadge} ${styles[TIER_CLASS[c.membershipTier] ?? '']}`}>
        {c.membershipTier}
      </span>
    ),
  },
  { key: 'account', header: 'Account', width: '200px', render: (c) => accountNameMap.get(c.accountId) ?? c.accountId },
];

const txnColumns: Column<TransactionalRecord>[] = [
  { key: 'contactName', header: 'Contact', render: (r) => r.contactName },
  { key: 'description', header: 'Description', render: (r) => r.description },
  { key: 'date', header: 'Date', width: '120px', render: (r) => r.date },
  { key: 'amount', header: 'Amount', width: '100px', render: (r) => `$${r.amount.toFixed(2)}` },
  { key: 'account', header: 'Account', width: '200px', render: (r) => accountNameMap.get(r.accountId) ?? r.accountId },
];

export default function DatabasesPage() {
  const { filterByAccount } = useAccount();

  const tabs = useMemo(() => [
    { key: 'contacts', label: 'Contacts' },
    ...transactionalDatabases.map((db) => ({ key: db.id, label: db.name })),
  ], []);

  const [activeTab, setActiveTab] = useState('contacts');

  const contactData = filterByAccount(spaContacts);

  const activeTxnDb = transactionalDatabases.find((db) => db.id === activeTab);
  const txnData = activeTxnDb ? filterByAccount(activeTxnDb.records) : [];

  return (
    <PageShell title="Databases" subtitle="Contact and transactional databases">
      <TabBar tabs={tabs} activeKey={activeTab} onTabChange={setActiveTab} />
      <div className={styles.tableArea}>
        {activeTab === 'contacts' ? (
          <DataTable columns={contactColumns} data={contactData} emptyMessage="No contacts found" />
        ) : (
          <DataTable columns={txnColumns} data={txnData} emptyMessage="No records found" />
        )}
      </div>
    </PageShell>
  );
}
