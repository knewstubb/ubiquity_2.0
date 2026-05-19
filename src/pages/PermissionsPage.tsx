import { useState, useRef, useCallback } from 'react';
import { FloppyDisk } from '@phosphor-icons/react';
import { PageShell } from '../components/layout/PageShell';
import { TabBar } from '../components/permissions/TabBar';
import { PermissionGroupsTab } from '../components/permissions/PermissionGroupsTab';
import { UserPermissionsTab } from '../components/permissions/UserPermissionsTab';
import { AccountPermissionsTab } from '../components/permissions/AccountPermissionsTab';

type TabKey = 'groups' | 'users' | 'accounts';

const tabs = [
  { key: 'groups', label: 'Permission Groups' },
  { key: 'users', label: 'User Permissions' },
  { key: 'accounts', label: 'Account Permissions' },
];

export interface PermissionsSaveHandle {
  isDirty: boolean;
  onSave: () => void;
}

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('groups');
  const saveHandleRef = useRef<PermissionsSaveHandle>({ isDirty: false, onSave: () => {} });

  const [, forceRender] = useState(0);

  const registerSaveHandle = useCallback((handle: PermissionsSaveHandle) => {
    saveHandleRef.current = handle;
    forceRender((n) => n + 1);
  }, []);

  const saveAction = (
    <button
      className="inline-flex items-center gap-2 px-4 py-2 border-none rounded-md bg-primary font-sans text-sm font-medium text-primary-foreground cursor-pointer transition-colors duration-150 whitespace-nowrap shrink-0 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary"
      onClick={() => saveHandleRef.current.onSave()}
      disabled={!saveHandleRef.current.isDirty}
    >
      <FloppyDisk size={16} weight="bold" />
      Save Changes
    </button>
  );

  return (
    <PageShell title="Permissions" action={saveAction}>
      <TabBar tabs={tabs} activeKey={activeTab} onTabChange={(key) => setActiveTab(key as TabKey)} />
      <div className="h-[calc(100vh-240px)] min-h-[480px] overflow-hidden">
        {activeTab === 'groups' && <PermissionGroupsTab onRegisterSave={registerSaveHandle} />}
        {activeTab === 'users' && <UserPermissionsTab onRegisterSave={registerSaveHandle} />}
        {activeTab === 'accounts' && <AccountPermissionsTab onRegisterSave={registerSaveHandle} />}
      </div>
    </PageShell>
  );
}
