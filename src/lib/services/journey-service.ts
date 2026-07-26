/**
 * Journey Builder Service — mirrors the JourneyBuilder domain (ubiquity-platform-api)
 *
 * Real service: JourneyBuilder (.NET 10, Fargate ARM64)
 * gRPC coverage: 100% (modern service, native gRPC)
 * Access from Next.js: direct gRPC to JourneyBuilder API
 * Status: IN PROGRESS (walking skeleton — CRUD works, Temporal prototype done)
 *
 * Owns:
 * - Journey definitions (visual workflow canvas data)
 * - Journey nodes (steps in a journey: triggers, actions, waits, branches)
 * - Journey connections/edges (links between nodes)
 * - Journey execution tracking (via Temporal workflows)
 *
 * Key constraints:
 * - Journeys store their canvas state as JSONB (nodes + edges arrays)
 * - Execution uses Temporal workflows — each journey gets a durable workflow instance
 * - Node types: trigger, action, wait, branch, end, join
 * - Journey statuses: draft, active, paused, completed, failed
 * - Config size limits: 10KB per journey, 5KB per node/connection
 * - Each journey belongs to a campaign (campaignId) and an account (accountId)
 *
 * Production: .NET 10 gRPC API + Temporal worker on ECS Fargate
 * Production database: Aurora PostgreSQL (journey_builder schema)
 * Prototype equivalent: journeys table (with nodes/edges as JSONB)
 *
 * Note: This is one of the REFERENCE IMPLEMENTATIONS for the modern platform.
 * Its patterns (domain structure, gRPC API, Temporal worker, EF Core migrations)
 * are the template for all future domains.
 */

// Re-export from existing adapters
export {
  getAll as getJourneyDefinitions,
  addJourney,
  updateJourney,
  deleteJourney,
  updateNode,
  addNode,
  removeNode,
  addEdge,
  removeEdge,
} from '../adapters/journeys-adapter';
