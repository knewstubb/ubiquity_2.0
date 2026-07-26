/**
 * Job model — mirrors u3_data.dbo.Job (the job engine working table)
 *
 * Production behaviour:
 * - Single-threaded per AccountLevel (in practice, all accounts share one thread)
 * - Jobs processed in round-robin fashion via ticks
 * - Each tick processes a "block size" of work (configurable per job type)
 * - SideLoad imports bypass the queue (separate threads, being constrained to max 4)
 * - Job steps can have sub-jobs (ParentJobID)
 * - Three queue levels exist (Normal, Express, Corporate) but only Normal is used
 *
 * Key job types and their owning services:
 * - import, bulk_update, download, clean → u3_list
 * - mailout, recurring_mailout, static_mailout → u3_mail
 * - txt_out, recurring_txt_out → u3_txt
 * - push_notification, recurring_push → u3_push
 * - triggered_email → u3_forms / u3_survey / u3_event (cross-service)
 * - billing_collation → u3_system (runs at 4:30am daily)
 * - report_collation → u3_survey / u3_event
 *
 * Prototype usage:
 * - UI should show job states (queued → running → complete/failed)
 * - Progress bars and queue position indicators
 * - Import operations should simulate entering the queue, not instant completion
 * - Mailout sends should show block-by-block progress
 */

export type JobType =
  | 'import'
  | 'bulk_update'
  | 'download'
  | 'clean'
  | 'mailout'
  | 'recurring_mailout'
  | 'txt_out'
  | 'push_notification'
  | 'triggered_email'
  | 'billing_collation'
  | 'report_collation'
  | 'export';

export type JobStatus =
  | 'queued'
  | 'running'
  | 'complete'
  | 'failed'
  | 'cancelled'
  | 'suspended';

export type JobPriority =
  | 'critical'     // Triggered emails, real-time push (time-sensitive)
  | 'high'         // Downloads (user actively waiting)
  | 'normal'       // Mailouts, scheduled sends
  | 'low'          // Imports, bulk updates
  | 'background';  // Billing, cleanup, report collation

export interface Job {
  id: string;
  accountId: string;
  jobType: JobType;
  status: JobStatus;
  priority: JobPriority;
  progress: number;           // 0-100
  parentJobId: string | null; // For sub-jobs (job steps)
  metadata: JobMetadata;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
}

export interface JobMetadata {
  /** Human-readable description shown in UI */
  description?: string;
  /** Total items to process (e.g., row count for import, recipient count for mailout) */
  totalItems?: number;
  /** Items processed so far */
  processedItems?: number;
  /** Block size — how many items per tick */
  blockSize?: number;
  /** Queue position (calculated, not stored in production) */
  queuePosition?: number;
  /** Source file name (for imports) */
  fileName?: string;
  /** Campaign/mailout name (for sends) */
  campaignName?: string;
}
