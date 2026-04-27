import { describe, it, expect, vi, beforeEach } from 'vitest';

const { s, from, qb, auth } = vi.hoisted(() => {
  const s = { data: null as unknown, error: null as unknown, configured: true };
  const t = (o: Record<string, unknown>) => Object.assign(o, { then: (r: (v: unknown) => void, j?: (e: unknown) => void) => Promise.resolve({ data: s.data, error: s.error }).then(r, j) });
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  qb.eq = vi.fn().mockImplementation(() => t(qb)); qb.single = vi.fn().mockImplementation(() => Promise.resolve({ data: s.data, error: s.error }));
  qb.select = vi.fn().mockImplementation(() => t(qb)); qb.insert = vi.fn().mockImplementation(() => t(qb));
  qb.update = vi.fn().mockImplementation(() => t(qb)); qb.delete = vi.fn().mockImplementation(() => t(qb));
  qb.upsert = vi.fn().mockImplementation(() => t(qb));
  const from = vi.fn().mockImplementation(() => t(qb));
  const auth = { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }) };
  return { s, from, qb, auth };
});

vi.mock('../../supabase', () => ({ supabase: { from, auth }, isSupabaseConfigured: () => s.configured }));

import * as adapter from '../permissions-adapter';
import { defaultPermissionGroups, defaultAssignments } from '../../../data/permissions';
import { users as localUsers } from '../../../data/users';

function set(data: unknown, error: unknown = null) { s.data = data; s.error = error; }
function reset() {
  s.data = null; s.error = null; s.configured = true; vi.clearAllMocks();
  const t = (o: Record<string, unknown>) => Object.assign(o, { then: (r: (v: unknown) => void, j?: (e: unknown) => void) => Promise.resolve({ data: s.data, error: s.error }).then(r, j) });
  qb.eq.mockImplementation(() => t(qb)); qb.single.mockImplementation(() => Promise.resolve({ data: s.data, error: s.error }));
  qb.select.mockImplementation(() => t(qb)); qb.insert.mockImplementation(() => t(qb));
  qb.update.mockImplementation(() => t(qb)); qb.delete.mockImplementation(() => t(qb));
  qb.upsert.mockImplementation(() => t(qb));
  from.mockImplementation(() => t(qb)); auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
}

const groupRow = { id: 'grp-1', name: 'Admin', description: 'Full access', permissions: { Dashboard: { create: true, read: true, update: true, delete: true } } };
const assignmentRow = { user_id: 'usr-1', account_id: 'acc-1', permission_group_id: 'grp-1', custom_permissions: null };
const userRow = { id: 'usr-1', name: 'Jane', email: 'jane@test.com', initials: 'JD' };

describe('permissions-adapter', () => {
  beforeEach(() => reset());

  describe('Supabase mode', () => {
    it('getPermissionGroups fetches and maps rows', async () => {
      set([groupRow]);
      const result = await adapter.getPermissionGroups();
      expect(from).toHaveBeenCalledWith('permission_groups');
      expect(result[0].id).toBe('grp-1');
    });

    it('getPermissionGroups falls back to local data on error', async () => {
      set(null, { message: 'error' });
      expect(await adapter.getPermissionGroups()).toBe(defaultPermissionGroups);
    });

    it('getAssignments maps snake_case to camelCase', async () => {
      set([assignmentRow]);
      const result = await adapter.getAssignments();
      expect(result[0].userId).toBe('usr-1');
      expect(result[0].accountId).toBe('acc-1');
    });

    it('getAssignments falls back to local data on error', async () => {
      set(null, { message: 'error' });
      expect(await adapter.getAssignments()).toBe(defaultAssignments);
    });

    it('getUsers fetches from prototype_users table', async () => {
      set([userRow]);
      const result = await adapter.getUsers();
      expect(from).toHaveBeenCalledWith('prototype_users');
      expect(result[0]).toEqual({ id: 'usr-1', name: 'Jane', email: 'jane@test.com', initials: 'JD' });
    });

    it('getUsers falls back to local data on error', async () => {
      set(null, { message: 'error' });
      expect(await adapter.getUsers()).toBe(localUsers);
    });

    it('addPermissionGroup inserts row', async () => {
      set(groupRow);
      const result = await adapter.addPermissionGroup({ id: 'grp-1', name: 'Admin', description: 'Full access', permissions: groupRow.permissions });
      expect(qb.insert).toHaveBeenCalledWith(expect.objectContaining({ id: 'grp-1' }));
      expect(result.id).toBe('grp-1');
    });

    it('updatePermissionGroup sends partial row', async () => {
      set({ ...groupRow, name: 'Super Admin' });
      const result = await adapter.updatePermissionGroup('grp-1', { name: 'Super Admin' });
      expect(qb.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'Super Admin' }));
      expect(result.name).toBe('Super Admin');
    });

    it('deletePermissionGroup deletes by id', async () => {
      set(null);
      await adapter.deletePermissionGroup('grp-1');
      expect(qb.delete).toHaveBeenCalled();
      expect(qb.eq).toHaveBeenCalledWith('id', 'grp-1');
    });

    it('setAssignmentsForUser deletes existing then inserts new', async () => {
      set(null);
      await adapter.setAssignmentsForUser('usr-1', [
        { userId: 'usr-1', accountId: 'acc-1', permissionGroupId: 'grp-1', customPermissions: null },
      ]);
      expect(from).toHaveBeenCalledWith('user_account_assignments');
      expect(qb.delete).toHaveBeenCalled();
      expect(qb.insert).toHaveBeenCalledWith([expect.objectContaining({ user_id: 'usr-1', account_id: 'acc-1' })]);
    });

    it('setAssignmentForUserAccount upserts single assignment', async () => {
      set(null);
      await adapter.setAssignmentForUserAccount('usr-1', 'acc-1', 'grp-1', null);
      expect(qb.upsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'usr-1', account_id: 'acc-1' }));
    });

    it('removeAssignment deletes by userId and accountId', async () => {
      set(null);
      await adapter.removeAssignment('usr-1', 'acc-1');
      expect(qb.delete).toHaveBeenCalled();
      expect(qb.eq).toHaveBeenCalledWith('user_id', 'usr-1');
    });
  });

  describe('Local fallback mode', () => {
    beforeEach(() => { s.configured = false; });

    it('getPermissionGroups returns local groups', async () => {
      expect(await adapter.getPermissionGroups()).toBe(defaultPermissionGroups);
      expect(from).not.toHaveBeenCalled();
    });

    it('getAssignments returns local assignments', async () => {
      expect(await adapter.getAssignments()).toBe(defaultAssignments);
    });

    it('getUsers returns local users', async () => {
      expect(await adapter.getUsers()).toBe(localUsers);
    });

    it('addPermissionGroup returns group as-is', async () => {
      const g = { id: 'grp-1', name: 'Test', description: '', permissions: {} };
      expect(await adapter.addPermissionGroup(g)).toBe(g);
    });

    it('deletePermissionGroup is a no-op', async () => {
      await adapter.deletePermissionGroup('grp-1');
      expect(from).not.toHaveBeenCalled();
    });

    it('mutation operations are no-ops', async () => {
      await adapter.setAssignmentsForUser('usr-1', []);
      await adapter.setAssignmentForUserAccount('usr-1', 'acc-1', 'grp-1', null);
      await adapter.removeAssignment('usr-1', 'acc-1');
      expect(from).not.toHaveBeenCalled();
    });
  });
});
