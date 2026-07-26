/**
 * Mail Service — mirrors u3_mail
 *
 * Real service: u3_mail (.NET 4.8, Windows container)
 * gRPC coverage: 4.0% (5/125 methods mapped via RemotingBridge)
 * Access from Next.js: via RemotingBridge only
 *
 * Owns:
 * - Campaigns (logical groupings of mailouts — called "ComponentGroups" internally)
 * - Mailout folders and individual mailouts
 * - Email templates and template folders
 * - Automated/recurring mailouts
 * - Triggered emails (fired by forms, surveys, events)
 * - Mailout reporting (opens, clicks, bounces, unsubscribes)
 * - Assets (images, colours, fonts used in emails)
 *
 * Key constraints:
 * - Sending a mailout is a JOB ENGINE operation (single-threaded queue)
 * - Email rendering uses ESL (Engage Scripting Language) — proprietary template language
 * - Rendering happens in Azure WebJobs (external to the mail service itself)
 * - Each individual email is rendered separately with per-contact personalisation
 * - Link tracking uses Rijndael encryption — all links are wrapped in tracking URLs
 * - GNA (Gone No Address): contacts that hard-bounce 3+ times are auto-suppressed
 * - Mail logs and events stored in per-account tables (MailLog_{accountGuidHex})
 *
 * Production databases: u3_mail (metadata), u3_data (per-account mail logs), u3_smta (sending state)
 * Prototype equivalent: campaigns, assets tables
 */

// Re-export from existing adapters
export {
  getAllCampaigns,
  getAllJourneys as getAllCampaignJourneys,
  addCampaign,
  updateCampaign,
  deleteCampaign,
  addJourney as addCampaignJourney,
  updateJourney as updateCampaignJourney,
  deleteJourney as deleteCampaignJourney,
} from '../adapters/campaigns-adapter';

export {
  getAll as getAssets,
  add as addAsset,
  update as updateAsset,
  del as deleteAsset,
} from '../adapters/assets-adapter';

// Note: In production, "sending a mailout" involves:
// 1. Job enters queue (may wait behind other jobs)
// 2. Job ticks through recipient list in blocks
// 3. Each block sent to Azure WebJobs for rendering
// 4. Rendered emails returned and queued for SMTA
// 5. SMTA delivers via SES
// 6. Delivery callbacks update mail log tables
//
// The prototype doesn't simulate this pipeline, but the UI should
// represent send operations as asynchronous with progress tracking.
