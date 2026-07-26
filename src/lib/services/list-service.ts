/**
 * List Service — mirrors u3_list
 *
 * Real service: u3_list (.NET 4.8, Windows container)
 * gRPC coverage: 6.3% (8/127 methods mapped via RemotingBridge)
 * Access from Next.js: via RemotingBridge only
 *
 * Owns:
 * - Contact databases (ListData_* per-account tables in production)
 * - Transactional databases (List_TransactionalData_* tables)
 * - Imports (CSV upload → job engine → SideLoad thread)
 * - Database schema/field definitions
 * - Segments (saved filter groups applied to contacts)
 * - Bulk operations (updates, downloads, clean)
 *
 * Key constraints:
 * - Contacts are per-account (in production: completely separate SQL tables per account)
 * - Dynamic/custom fields: production uses actual SQL columns; we use JSONB
 * - Imports go through the job engine (single-threaded queue) — NOT instant
 * - Schema changes trigger expensive rebuilds (new filterable fields aren't free)
 * - The "SqlWriter" converts filter conditions → SQL. High-risk area in production.
 * - Bulk updates and downloads are queued jobs, not synchronous operations
 *
 * Production databases: u3_list (metadata), u3_data (customer data), u3_data_scratch (temp import staging)
 * Prototype equivalent: contacts, treatments, products, segments tables (all with account_id RLS)
 */

// Re-export from existing adapters
export {
  getContacts,
  getTreatments,
  getProducts,
} from '../adapters/data-adapter';

export {
  getAll as getSegments,
  add as addSegment,
  update as updateSegment,
  del as deleteSegment,
} from '../adapters/segments-adapter';

// Note: In production, "importing contacts" is a job engine operation.
// It enters a queue, processes in ticks, and may take minutes for large files.
// The prototype simulates this as direct insertion but the UI should still
// show import progress and queue states.
