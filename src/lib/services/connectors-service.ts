/**
 * Connectors Service — mirrors the Connectors domain (Python/FastAPI + Prefect)
 *
 * Real service: Ubiquity-Connectors-Prefect (Python, FastAPI, Prefect orchestration)
 * gRPC coverage: 100% (modern service, native gRPC)
 * Access from Next.js: direct gRPC to Connectors API
 * Feature flag: FEATURE_NAME_CONNECTORS (account-level, percentage rollout)
 *
 * Owns:
 * - Connections (file transfer endpoints: S3, SFTP, Azure Blob)
 * - Automations (scheduled import/export jobs between UbiQuity and external systems)
 * - Field mappings and transformations
 * - File format configuration (CSV, JSON, XML)
 * - Schedule management (via Prefect)
 *
 * Key constraints:
 * - Feature-flagged: not all accounts have access (check CONNECTORS flag first)
 * - Automations are scheduled jobs — they run on a cadence, not on-demand
 * - Import automations ultimately call the legacy list service's import API
 * - Export automations read from the DataFlow gRPC API (when available) or legacy API
 * - Connection credentials are stored encrypted — never exposed to the frontend
 * - Each automation belongs to exactly one connection
 *
 * This is one of the few FULLY MODERN services — no legacy dependencies
 * except for the actual data read/write which goes through RemotingBridge or DataFlow.
 *
 * Production: Python/FastAPI on ECS Fargate, Prefect for orchestration
 * Prototype equivalent: connections, connectors tables
 */

// Re-export from existing adapters
export {
  getAll as getConnections,
  add as addConnection,
  update as updateConnection,
  del as deleteConnection,
} from '../adapters/connections-adapter';

export {
  getAll as getAutomations,
  add as addAutomation,
  update as updateAutomation,
  del as deleteAutomation,
  mapRowToConnector,
  mapConnectorToRow,
} from '../adapters/connectors-adapter';
