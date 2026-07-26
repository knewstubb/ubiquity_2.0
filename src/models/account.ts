/**
 * Account model — mirrors u3_system.dbo.Account
 *
 * Production behaviour:
 * - Accounts form a tree: root → child accounts (2 levels typical, unlimited supported)
 * - All accounts in a tree share the same SQL user (u3data_{root_account_guid})
 * - Settings inherit downward: child → parent → global default
 * - Users work with one account at a time (active account in session)
 * - Feature flag hash rollout uses the ROOT account ID (not the child)
 * - Account switching is an explicit action that changes session context
 *
 * In production:
 * - rootAccountId is stored on every account for fast tree root lookups
 * - childIds is derived (not stored directly — queried via parentId)
 * - The "account tree" is queried via AccountService.GetAccountTree gRPC
 */
export interface Account {
  id: string;
  name: string;
  parentId: string | null;
  rootAccountId: string;        // Denormalised: the tree root (equals id for root accounts)
  childIds: string[];           // Derived from parentId relationships (convenience for prototype)
  region: string;
  status: 'active' | 'inactive';
}
