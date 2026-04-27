import { supabase, isSupabaseConfigured } from '../supabase';
import type { PermissionGroup, UserAccountAssignment, PermissionUser, FunctionalPermissions } from '../../models/permissions';
import { defaultPermissionGroups, defaultAssignments } from '../../data/permissions';
import { users as localUsers } from '../../data/users';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToPermissionGroup(row: any): PermissionGroup {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    permissions: row.permissions,
  };
}

function mapPermissionGroupToRow(group: PermissionGroup) {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    permissions: group.permissions,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToAssignment(row: any): UserAccountAssignment {
  return {
    userId: row.user_id,
    accountId: row.account_id,
    permissionGroupId: row.permission_group_id,
    customPermissions: row.custom_permissions,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToUser(row: any): PermissionUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    initials: row.initials,
  };
}

export async function getPermissionGroups(): Promise<PermissionGroup[]> {
  if (!isSupabaseConfigured()) return defaultPermissionGroups;

  const { data, error } = await supabase!.from('permission_groups').select('*');
  if (error || !data) return defaultPermissionGroups;

  return data.map(mapRowToPermissionGroup);
}

export async function getAssignments(): Promise<UserAccountAssignment[]> {
  if (!isSupabaseConfigured()) return defaultAssignments;

  const { data, error } = await supabase!.from('user_account_assignments').select('*');
  if (error || !data) return defaultAssignments;

  return data.map(mapRowToAssignment);
}

export async function getUsers(): Promise<PermissionUser[]> {
  if (!isSupabaseConfigured()) return localUsers;

  const { data, error } = await supabase!.from('prototype_users').select('*');
  if (error || !data) return localUsers;

  return data.map(mapRowToUser);
}

export async function addPermissionGroup(group: PermissionGroup): Promise<PermissionGroup> {
  if (!isSupabaseConfigured()) return group;

  const row = mapPermissionGroupToRow(group);
  const { data, error } = await supabase!.from('permission_groups').insert(row).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to add permission group');

  return mapRowToPermissionGroup(data);
}

export async function updatePermissionGroup(id: string, updates: Partial<PermissionGroup>): Promise<PermissionGroup> {
  if (!isSupabaseConfigured()) return { id, ...updates } as PermissionGroup;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.permissions !== undefined) row.permissions = updates.permissions;

  const { data, error } = await supabase!.from('permission_groups').update(row).eq('id', id).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to update permission group');

  return mapRowToPermissionGroup(data);
}

export async function deletePermissionGroup(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase!.from('permission_groups').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function setAssignmentsForUser(userId: string, assignments: UserAccountAssignment[]): Promise<void> {
  if (!isSupabaseConfigured()) return;

  // Delete existing assignments for this user
  await supabase!.from('user_account_assignments').delete().eq('user_id', userId);

  if (assignments.length === 0) return;

  // Insert new assignments
  const rows = assignments.map((a) => ({
    user_id: a.userId,
    account_id: a.accountId,
    permission_group_id: a.permissionGroupId,
    custom_permissions: a.customPermissions,
  }));

  const { error } = await supabase!.from('user_account_assignments').insert(rows);
  if (error) throw new Error(error.message);
}

export async function setAssignmentForUserAccount(
  userId: string,
  accountId: string,
  groupId: string | null,
  customPermissions: Record<string, FunctionalPermissions> | null,
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase!
    .from('user_account_assignments')
    .upsert({
      user_id: userId,
      account_id: accountId,
      permission_group_id: groupId,
      custom_permissions: customPermissions,
    });
  if (error) throw new Error(error.message);
}

export async function removeAssignment(userId: string, accountId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase!
    .from('user_account_assignments')
    .delete()
    .eq('user_id', userId)
    .eq('account_id', accountId);
  if (error) throw new Error(error.message);
}
