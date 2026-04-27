import { Link } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { DataTable, type Column } from '../components/shared/DataTable';
import { users } from '../data/users';
import type { PermissionUser } from '../models/permissions';
import styles from './pages.module.css';

interface SettingsField {
  label: string;
  value: string;
}

const workspaceSettings: SettingsField[] = [
  { label: 'Workspace Name', value: 'Serenity Spa Group' },
  { label: 'Timezone', value: 'Pacific/Auckland (NZST)' },
  { label: 'Default Language', value: 'English (NZ)' },
  { label: 'Date Format', value: 'DD/MM/YYYY' },
  { label: 'Currency', value: 'NZD ($)' },
];

const userRoles: Record<string, string> = {
  'usr-001': 'Admin',
  'usr-002': 'Editor',
  'usr-003': 'Editor',
  'usr-004': 'Viewer',
  'usr-005': 'Viewer',
};

const userColumns: Column<PermissionUser>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (u) => (
      <div className={styles.userRow}>
        <span className={styles.userAvatar}>{u.initials}</span>
        <span className={styles.userName}>{u.name}</span>
      </div>
    ),
  },
  { key: 'email', header: 'Email', render: (u) => u.email },
  { key: 'role', header: 'Role', width: '120px', render: (u) => userRoles[u.id] ?? 'Viewer' },
];

export default function SettingsPage() {
  return (
    <PageShell title="Settings" subtitle="Workspace configuration and user management">
      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>Workspace Configuration</h2>
        <div className={styles.configCard}>
          {workspaceSettings.map((field) => (
            <div key={field.label} className={styles.configRow}>
              <span className={styles.configLabel}>{field.label}</span>
              <span className={styles.configValue}>{field.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>Users &amp; Permissions</h2>
        <DataTable columns={userColumns} data={users} emptyMessage="No users found" />
        <Link to="/settings/permissions" className={styles.managePermissionsLink}>
          Manage Permissions →
        </Link>
      </div>
    </PageShell>
  );
}
