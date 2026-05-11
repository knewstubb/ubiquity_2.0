import { Link } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { DataTable, type Column } from '../components/shared/DataTable';
import { users } from '../data/users';
import type { PermissionUser } from '../models/permissions';

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
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center text-xs font-semibold shrink-0">{u.initials}</span>
        <span className="text-sm text-foreground">{u.name}</span>
      </div>
    ),
  },
  { key: 'email', header: 'Email', render: (u) => u.email },
  { key: 'role', header: 'Role', width: '120px', render: (u) => userRoles[u.id] ?? 'Viewer' },
];

export default function SettingsPage() {
  return (
    <PageShell title="Settings" subtitle="Workspace configuration and user management">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Workspace Configuration</h2>
        <div className="bg-white border border-border rounded-md shadow-sm p-5">
          {workspaceSettings.map((field) => (
            <div key={field.label} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
              <span className="text-sm font-medium text-muted-foreground">{field.label}</span>
              <span className="text-sm text-foreground">{field.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-6 last:mb-0">
        <h2 className="text-base font-semibold text-foreground mb-4">Users &amp; Permissions</h2>
        <DataTable columns={userColumns} data={users} emptyMessage="No users found" />
        <Link to="/settings/permissions" className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-primary no-underline transition-colors duration-150 hover:text-accent-hover">
          Manage Permissions →
        </Link>
      </div>
    </PageShell>
  );
}
