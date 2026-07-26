/**
 * System Service — mirrors u3_system
 *
 * Real service: u3_system (.NET 4.8, Windows container)
 * gRPC coverage: 13.5% (46/341 methods mapped via RemotingBridge)
 * Access from Next.js: via RemotingBridge for most operations
 *
 * Owns:
 * - Accounts (hierarchy, settings, creation, deletion)
 * - Users/Members (authentication, permissions, sessions)
 * - Feature flags (per-account resolution)
 * - Billing (nightly aggregation job)
 * - Filters (saved filter definitions)
 * - Layouts (form/survey/event templates)
 * - Service schemas (metadata about filterable fields)
 * - Error/bug logging
 *
 * Key constraints:
 * - Accounts form a tree: root → child (2 levels typical)
 * - Settings inherit downward (child → parent → global default)
 * - One active session per user per browser (cookie-based)
 * - Feature flags resolve: disabled globally → enabled globally → per-account override → hash rollout
 * - Billing runs at 4:30am daily — usage data is NOT real-time
 * - Schema rebuilds are expensive and cached — adding filterable fields has cost
 *
 * Production databases: u3_system
 * Prototype equivalent: accounts, prototype_users, permission_groups, user_account_assignments tables
 */

// Re-export from existing adapters
export {
  getAll as getAccounts,
  getById as getAccountById,
} from '../adapters/accounts-adapter';

export {
  getPermissionGroups,
  getAssignments,
  getUsers,
  addPermissionGroup,
  updatePermissionGroup,
  deletePermissionGroup,
  setAssignmentsForUser,
  setAssignmentForUserAccount,
  removeAssignment,
  setSystemAdmin,
} from '../adapters/permissions-adapter';

// Feature flags — matches production resolution logic
export {
  resolveFeatureFlag,
  isFeatureEnabled,
  resolveAllFlags,
} from './feature-flags';

// Account hierarchy and settings inheritance
export {
  getRootAccount,
  getAccountTree,
  getAncestorChain,
  resolveAccountSetting,
  areInSameTree,
  getDirectChildren,
  getAllDescendants,
} from './account-hierarchy';
