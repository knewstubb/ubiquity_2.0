import type { Account } from '../models/account';
import type { FunctionalPermissions, PermissionGroup, UserAccountAssignment } from '../models/permissions';

// --- Functional Groups (map to app navigation sections) ---

export const FUNCTIONAL_GROUPS = [
  'Dashboard',
  'Audiences',
  'Campaigns',
  'Content',
  'Analytics',
  'Settings',
] as const;

export type FunctionalGroupName = (typeof FUNCTIONAL_GROUPS)[number];

// --- Hierarchy Icon Utility ---

export function getHierarchyIcon(account: Account): 'buildings' | 'globe' | 'pin' {
  if (account.parentId === null) return 'buildings';
  if (account.childIds.length > 0) return 'globe';
  return 'pin';
}

// --- CRUD helpers ---

const allOn: FunctionalPermissions = { create: true, read: true, update: true, delete: true };
const allOff: FunctionalPermissions = { create: false, read: false, update: false, delete: false };
const readOnly: FunctionalPermissions = { create: false, read: true, update: false, delete: false };

function makePermissions(
  map: Record<FunctionalGroupName, FunctionalPermissions>,
): Record<string, FunctionalPermissions> {
  return { ...map };
}

// --- Default Permission Groups ---

export const defaultPermissionGroups: PermissionGroup[] = [
  {
    id: 'grp-admin',
    name: 'Admin',
    description: 'Full access to all features and settings.',
    permissions: makePermissions({
      Dashboard: allOn,
      Audiences: allOn,
      Campaigns: allOn,
      Content: allOn,
      Analytics: allOn,
      Settings: allOn,
    }),
  },
  {
    id: 'grp-editor',
    name: 'Editor',
    description: 'Can manage content and campaigns but not analytics or settings.',
    permissions: makePermissions({
      Dashboard: allOn,
      Audiences: allOn,
      Campaigns: allOn,
      Content: allOn,
      Analytics: allOff,
      Settings: allOff,
    }),
  },
  {
    id: 'grp-viewer',
    name: 'Viewer',
    description: 'Read-only access to data and reports.',
    permissions: makePermissions({
      Dashboard: allOn,
      Audiences: readOnly,
      Campaigns: allOff,
      Content: allOff,
      Analytics: readOnly,
      Settings: allOff,
    }),
  },
];

// --- Seed User-Account Assignments ---

const cascadingAccounts = [
  'acc-master',
  'acc-auckland',
  'acc-wellington',
  'acc-christchurch',
  'acc-queenstown',
];

function makeCascadingAssignments(
  userId: string,
  groupId: string,
): UserAccountAssignment[] {
  return cascadingAccounts.map((accountId) => ({
    userId,
    accountId,
    permissionGroupId: groupId,
    customPermissions: null,
  }));
}

export const defaultAssignments: UserAccountAssignment[] = [
  // Aroha Mitchell (usr-001): Admin on acc-master, cascading to all children
  ...makeCascadingAssignments('usr-001', 'grp-admin'),

  // Nikau Patel (usr-002): Editor on acc-master, cascading to all children
  ...makeCascadingAssignments('usr-002', 'grp-editor'),

  // Maia Chen (usr-003): Editor on acc-auckland and acc-wellington only
  { userId: 'usr-003', accountId: 'acc-auckland', permissionGroupId: 'grp-editor', customPermissions: null },
  { userId: 'usr-003', accountId: 'acc-wellington', permissionGroupId: 'grp-editor', customPermissions: null },

  // Tāne Williams (usr-004): Viewer on acc-master, cascading to all children
  ...makeCascadingAssignments('usr-004', 'grp-viewer'),

  // Isla Thompson (usr-005): Custom on acc-queenstown only
  {
    userId: 'usr-005',
    accountId: 'acc-queenstown',
    permissionGroupId: null,
    customPermissions: {
      Dashboard: { create: true, read: true, update: true, delete: true },
      Audiences: { create: true, read: true, update: true, delete: true },
      Campaigns: { create: false, read: false, update: false, delete: false },
      Content: { create: false, read: false, update: false, delete: false },
      Analytics: { create: false, read: false, update: false, delete: false },
      Settings: { create: false, read: false, update: false, delete: false },
    },
  },
];
