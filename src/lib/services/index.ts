/**
 * Service Layer Index
 *
 * This layer groups data access by production service ownership.
 * Each service module documents which real backend service owns the data,
 * what constraints apply, and what the gRPC coverage is.
 *
 * Usage:
 *   import { getContacts } from '../lib/services/list-service';
 *   import { getAccounts } from '../lib/services/system-service';
 *
 * For developers:
 *   Read the JSDoc at the top of each service file to understand:
 *   - Which real service owns this data
 *   - What % of the service is accessible via gRPC (vs requiring RemotingBridge work)
 *   - What operations are synchronous vs queued (job engine)
 *   - What constraints apply in production
 *
 * Service boundary map:
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ system-service    │ Accounts, users, permissions, feature flags,    │
 * │ (u3_system)       │ billing, filters, layouts, schemas              │
 * │                   │ gRPC: 13.5% | 46/341 methods                    │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ list-service      │ Contacts, transactions, imports, segments,       │
 * │ (u3_list)         │ database schema, bulk operations                 │
 * │                   │ gRPC: 6.3% | 8/127 methods                      │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ mail-service      │ Campaigns, mailouts, templates, assets,          │
 * │ (u3_mail)         │ triggered emails, mail reporting                 │
 * │                   │ gRPC: 4.0% | 5/125 methods                      │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ connectors-service│ Connections (S3/SFTP/Azure), automations,        │
 * │ (Python/FastAPI)  │ import/export scheduling                         │
 * │                   │ gRPC: 100% | Fully modern                        │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ journey-service   │ Journey definitions, nodes, edges, execution     │
 * │ (platform-api)    │ Temporal workflows                               │
 * │                   │ gRPC: 100% | Walking skeleton                    │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ account-sync-svc  │ Sync rules, column mappings, reference mappings  │
 * │ (platform-api)    │ CDC event processing via Kinesis                 │
 * │                   │ Status: PROPOSED | Depends on DataFlow           │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Services NOT yet represented in this prototype:
 * - u3_survey (0% gRPC) — surveys, responses, triggered emails
 * - u3_forms (0% gRPC) — web forms, submissions, triggered emails
 * - u3_event (0% gRPC) — events, registrations, triggered emails
 * - u3_txt (0% gRPC) — SMS programmes, TXT Out
 * - u3_push (0% gRPC) — push notifications
 * - u3_webtracking (0% gRPC) — website visitor tracking, goals
 * - u3_webhooks (0% gRPC) — outbound webhook delivery
 * - u3_smta (0% gRPC) — email/SMS/push sending engine
 * - u3_social (0% gRPC) — Facebook Audience integration
 * - u3_share (0% gRPC) — social media activity recording
 *
 * When adding a new feature, check which service owns the data.
 * If it's 0% gRPC, the new frontend can ONLY access it through RemotingBridge,
 * which means someone needs to map the specific methods to gRPC first.
 */

export * as systemService from './system-service';
export * as listService from './list-service';
export * as mailService from './mail-service';
export * as connectorsService from './connectors-service';
export * as journeyService from './journey-service';
export * as jobService from './job-service';
export * as accountSyncService from './account-sync-service';
