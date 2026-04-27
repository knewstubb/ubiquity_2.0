import { useState } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { TabBar } from '../components/permissions/TabBar';
import { PermissionGroupsTab } from '../components/permissions/PermissionGroupsTab';
import { UserPermissionsTab } from '../components/permissions/UserPermissionsTab';
import { AccountPermissionsTab } from '../components/permissions/AccountPermissionsTab';
import styles from './PermissionsPage.module.css';

type TabKey = 'groups' | 'users' | 'accounts';

const tabs = [
  { key: 'groups', label: 'Permission Groups' },
  { key: 'users', label: 'User Permissions' },
  { key: 'accounts', label: 'Account Permissions' },
];

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('groups');

  return (
    <PageShell title="Permissions">
      <TabBar tabs={tabs} activeKey={activeTab} onTabChange={(key) => setActiveTab(key as TabKey)} />
      <div className={styles.tabContent}>
        {activeTab === 'groups' && <PermissionGroupsTab />}
        {activeTab === 'users' && <UserPermissionsTab />}
        {activeTab === 'accounts' && <AccountPermissionsTab />}
      </div>
    </PageShell>
  );
}
