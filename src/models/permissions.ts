export type CrudPermission = 'create' | 'read' | 'update' | 'delete';

export interface FunctionalPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, FunctionalPermissions>; // keyed by functional group name
}

export interface PermissionUser {
  id: string;
  name: string;
  email: string;
  initials: string;
}

export interface UserAccountAssignment {
  userId: string;
  accountId: string;
  permissionGroupId: string | null; // null = custom
  customPermissions: Record<string, FunctionalPermissions> | null; // only set when custom
}
