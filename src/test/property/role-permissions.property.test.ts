import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { arbSimulatedRole } from '../generators';
import { ROLE_PERMISSIONS } from '../../contexts/RoleSimulatorContext';
import type { FunctionalPermissions } from '../../models/permissions';
import type { SimulatedRole } from '../../lib/session-store';

/**
 * Property 10: Role selection updates permission context
 *
 * For any simulated role (admin, marketer, viewer), the ROLE_PERMISSIONS
 * constant must contain exactly the predefined CRUD matrix matching the
 * Persona Permission Sets table from the design document.
 *
 * **Validates: Requirements 7.2**
 */

const CRUD: FunctionalPermissions = { create: true, read: true, update: true, delete: true };
const CR_ONLY: FunctionalPermissions = { create: true, read: true, update: false, delete: false };
const R_ONLY: FunctionalPermissions = { create: false, read: true, update: false, delete: false };
const NONE: FunctionalPermissions = { create: false, read: false, update: false, delete: false };

const EXPECTED_PERMISSIONS: Record<SimulatedRole, Record<string, FunctionalPermissions>> = {
  admin: {
    Dashboard: CRUD,
    Audiences: CRUD,
    Campaigns: CRUD,
    Content: CRUD,
    Analytics: CRUD,
    Settings: CRUD,
  },
  marketer: {
    Dashboard: CRUD,
    Audiences: CR_ONLY,
    Campaigns: CRUD,
    Content: CRUD,
    Analytics: R_ONLY,
    Settings: NONE,
  },
  viewer: {
    Dashboard: R_ONLY,
    Audiences: R_ONLY,
    Campaigns: NONE,
    Content: NONE,
    Analytics: R_ONLY,
    Settings: NONE,
  },
};

const FUNCTIONAL_GROUPS = ['Dashboard', 'Audiences', 'Campaigns', 'Content', 'Analytics', 'Settings'];

describe('Property 10: Role selection updates permission context', () => {
  it('for any role, ROLE_PERMISSIONS matches the predefined CRUD matrix exactly', () => {
    fc.assert(
      fc.property(arbSimulatedRole(), (role) => {
        const actual = ROLE_PERMISSIONS[role];
        const expected = EXPECTED_PERMISSIONS[role];

        // Every expected functional group must be present with the correct permissions
        for (const group of FUNCTIONAL_GROUPS) {
          expect(actual[group]).toEqual(expected[group]);
        }

        // No extra keys beyond the expected functional groups
        expect(Object.keys(actual).sort()).toEqual(FUNCTIONAL_GROUPS.slice().sort());
      }),
      { numRuns: 100 },
    );
  });

  it('for any role, every permission value is a boolean', () => {
    fc.assert(
      fc.property(arbSimulatedRole(), (role) => {
        const perms = ROLE_PERMISSIONS[role];

        for (const group of Object.keys(perms)) {
          const fp = perms[group];
          expect(typeof fp.create).toBe('boolean');
          expect(typeof fp.read).toBe('boolean');
          expect(typeof fp.update).toBe('boolean');
          expect(typeof fp.delete).toBe('boolean');
        }
      }),
      { numRuns: 100 },
    );
  });
});
