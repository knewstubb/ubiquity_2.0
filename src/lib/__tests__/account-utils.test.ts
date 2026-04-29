import { describe, it, expect } from 'vitest';
import { resolveAccessibleRoots, getAccountTree } from '../account-utils';
import type { Account } from '../../models/account';
import type { UserAccountAssignment } from '../../models/permissions';

// --- Minimal test accounts ---

const testAccounts: Account[] = [
  { id: 'root-a', name: 'Root A', parentId: null, childIds: ['child-a1', 'child-a2'], region: 'R', status: 'active' },
  { id: 'child-a1', name: 'Child A1', parentId: 'root-a', childIds: ['grandchild-a1'], region: 'R', status: 'active' },
  { id: 'child-a2', name: 'Child A2', parentId: 'root-a', childIds: [], region: 'R', status: 'active' },
  { id: 'grandchild-a1', name: 'Grandchild A1', parentId: 'child-a1', childIds: [], region: 'R', status: 'active' },
  { id: 'root-b', name: 'Root B', parentId: null, childIds: ['child-b1'], region: 'R', status: 'active' },
  { id: 'child-b1', name: 'Child B1', parentId: 'root-b', childIds: [], region: 'R', status: 'active' },
  { id: 'root-c', name: 'Root C', parentId: null, childIds: [], region: 'R', status: 'active' },
];

function makeAssignment(userId: string, accountId: string): UserAccountAssignment {
  return { userId, accountId, permissionGroupId: 'grp-viewer', customPermissions: null };
}

describe('resolveAccessibleRoots', () => {
  it('returns the single root for a user assigned to the root directly', () => {
    const assignments = [makeAssignment('u1', 'root-a')];
    const roots = resolveAccessibleRoots(assignments, testAccounts, 'u1');
    expect(roots.map(r => r.id)).toEqual(['root-a']);
  });

  it('traces a child assignment up to its root', () => {
    const assignments = [makeAssignment('u1', 'child-a1')];
    const roots = resolveAccessibleRoots(assignments, testAccounts, 'u1');
    expect(roots.map(r => r.id)).toEqual(['root-a']);
  });

  it('traces a grandchild assignment up to its root', () => {
    const assignments = [makeAssignment('u1', 'grandchild-a1')];
    const roots = resolveAccessibleRoots(assignments, testAccounts, 'u1');
    expect(roots.map(r => r.id)).toEqual(['root-a']);
  });

  it('deduplicates when multiple assignments map to the same root', () => {
    const assignments = [
      makeAssignment('u1', 'root-a'),
      makeAssignment('u1', 'child-a1'),
      makeAssignment('u1', 'grandchild-a1'),
    ];
    const roots = resolveAccessibleRoots(assignments, testAccounts, 'u1');
    expect(roots.map(r => r.id)).toEqual(['root-a']);
  });

  it('returns multiple roots for a multi-account user', () => {
    const assignments = [
      makeAssignment('u1', 'child-a1'),
      makeAssignment('u1', 'child-b1'),
    ];
    const roots = resolveAccessibleRoots(assignments, testAccounts, 'u1');
    expect(roots.map(r => r.id).sort()).toEqual(['root-a', 'root-b']);
  });

  it('filters by userId — ignores other users assignments', () => {
    const assignments = [
      makeAssignment('u1', 'root-a'),
      makeAssignment('u2', 'root-b'),
    ];
    const roots = resolveAccessibleRoots(assignments, testAccounts, 'u1');
    expect(roots.map(r => r.id)).toEqual(['root-a']);
  });

  it('returns empty array when user has no assignments', () => {
    const roots = resolveAccessibleRoots([], testAccounts, 'u1');
    expect(roots).toEqual([]);
  });

  it('skips assignments referencing non-existent accounts', () => {
    const assignments = [makeAssignment('u1', 'non-existent')];
    const roots = resolveAccessibleRoots(assignments, testAccounts, 'u1');
    expect(roots).toEqual([]);
  });
});

describe('getAccountTree', () => {
  it('returns root + all descendants for a root with children', () => {
    const tree = getAccountTree('root-a', testAccounts);
    const ids = tree.map(a => a.id).sort();
    expect(ids).toEqual(['child-a1', 'child-a2', 'grandchild-a1', 'root-a']);
  });

  it('returns just the root for a root with no children', () => {
    const tree = getAccountTree('root-c', testAccounts);
    expect(tree.map(a => a.id)).toEqual(['root-c']);
  });

  it('returns a subtree when starting from a non-root account', () => {
    const tree = getAccountTree('child-a1', testAccounts);
    const ids = tree.map(a => a.id).sort();
    expect(ids).toEqual(['child-a1', 'grandchild-a1']);
  });

  it('returns empty array for a non-existent root ID', () => {
    const tree = getAccountTree('non-existent', testAccounts);
    expect(tree).toEqual([]);
  });

  it('returns root-b + child-b1', () => {
    const tree = getAccountTree('root-b', testAccounts);
    const ids = tree.map(a => a.id).sort();
    expect(ids).toEqual(['child-b1', 'root-b']);
  });
});
