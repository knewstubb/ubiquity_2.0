/**
 * Job Service — mirrors the JobProcessor in u3_system/u3_list/u3_mail
 *
 * Real service: JobProcessor runs inside each u3_* service container
 * The job ENGINE is in u3_system; job IMPLEMENTATIONS are in each product service.
 *
 * Production behaviour:
 * - Single-threaded per AccountLevel (effectively one thread for all accounts)
 * - Round-robin: dequeue → tick → re-enqueue at back
 * - Each tick processes one "block" of work (configurable block size)
 * - A long tick (e.g., SQL bulk insert) blocks ALL other jobs
 * - SideLoad imports bypass the queue (separate threads, max 4 concurrent)
 *
 * Key implication for feature design:
 * - Any operation that takes >1 second should be a job (not synchronous)
 * - UI must show: queue position, progress, estimated time, cancel option
 * - A 500K import blocks other accounts' mailouts while it runs
 * - Priority scheduling is being added (not yet in production)
 *
 * This prototype doesn't run actual background jobs. Instead:
 * - Jobs are created with status 'queued'
 * - UI can simulate progress transitions
 * - The seed data shows a realistic queue snapshot
 */

import type { Job, JobType, JobStatus, JobPriority, JobMetadata } from '../../models/job';
import { jobs as localJobs } from '../../data/jobs';

// In-memory store for the prototype (no Supabase table needed yet)
let jobStore: Job[] = [...localJobs];

/**
 * Get all jobs, optionally filtered by account and/or status.
 */
export function getJobs(filters?: {
  accountId?: string;
  status?: JobStatus | JobStatus[];
  jobType?: JobType;
}): Job[] {
  let result = [...jobStore];

  if (filters?.accountId) {
    result = result.filter(j => j.accountId === filters.accountId);
  }
  if (filters?.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    result = result.filter(j => statuses.includes(j.status));
  }
  if (filters?.jobType) {
    result = result.filter(j => j.jobType === filters.jobType);
  }

  return result;
}

/**
 * Get a single job by ID.
 */
export function getJobById(id: string): Job | undefined {
  return jobStore.find(j => j.id === id);
}

/**
 * Get the current queue — all jobs that are queued or running, ordered by priority then createdAt.
 */
export function getQueue(accountId?: string): Job[] {
  const priorityOrder: Record<JobPriority, number> = {
    critical: 0,
    high: 1,
    normal: 2,
    low: 3,
    background: 4,
  };

  let queue = jobStore.filter(j => j.status === 'queued' || j.status === 'running');

  if (accountId) {
    queue = queue.filter(j => j.accountId === accountId);
  }

  return queue.sort((a, b) => {
    // Running jobs first
    if (a.status === 'running' && b.status !== 'running') return -1;
    if (b.status === 'running' && a.status !== 'running') return 1;
    // Then by priority
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    // Then by creation time (FIFO within same priority)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

/**
 * Create a new job and add it to the queue.
 *
 * In production, this would call the relevant service's AddJob method,
 * which inserts into u3_data.dbo.Job and signals the JobProcessor.
 */
export function createJob(params: {
  accountId: string;
  jobType: JobType;
  priority?: JobPriority;
  metadata?: JobMetadata;
}): Job {
  const defaultPriority: Record<JobType, JobPriority> = {
    import: 'low',
    bulk_update: 'low',
    download: 'high',
    clean: 'background',
    mailout: 'normal',
    recurring_mailout: 'normal',
    txt_out: 'normal',
    push_notification: 'normal',
    triggered_email: 'critical',
    billing_collation: 'background',
    report_collation: 'background',
    export: 'normal',
  };

  const job: Job = {
    id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    accountId: params.accountId,
    jobType: params.jobType,
    status: 'queued',
    priority: params.priority ?? defaultPriority[params.jobType],
    progress: 0,
    parentJobId: null,
    metadata: params.metadata ?? {},
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    error: null,
  };

  jobStore = [...jobStore, job];
  return job;
}

/**
 * Update a job's status (simulate state transitions).
 */
export function updateJobStatus(
  id: string,
  status: JobStatus,
  updates?: Partial<Pick<Job, 'progress' | 'error' | 'metadata'>>,
): Job | undefined {
  const idx = jobStore.findIndex(j => j.id === id);
  if (idx === -1) return undefined;

  const now = new Date().toISOString();
  const job = { ...jobStore[idx] };

  job.status = status;
  if (updates?.progress !== undefined) job.progress = updates.progress;
  if (updates?.error !== undefined) job.error = updates.error;
  if (updates?.metadata) job.metadata = { ...job.metadata, ...updates.metadata };

  if (status === 'running' && !job.startedAt) {
    job.startedAt = now;
  }
  if (status === 'complete' || status === 'failed' || status === 'cancelled') {
    job.completedAt = now;
    if (status === 'complete') job.progress = 100;
  }

  jobStore = [...jobStore.slice(0, idx), job, ...jobStore.slice(idx + 1)];
  return job;
}

/**
 * Cancel a job (only if queued or running).
 */
export function cancelJob(id: string): boolean {
  const job = jobStore.find(j => j.id === id);
  if (!job || (job.status !== 'queued' && job.status !== 'running')) return false;

  updateJobStatus(id, 'cancelled');
  return true;
}

/**
 * Get queue position for a specific job.
 * Returns 0 if running, 1+ if queued (position in queue), -1 if not in queue.
 */
export function getQueuePosition(jobId: string): number {
  const queue = getQueue();
  const idx = queue.findIndex(j => j.id === jobId);
  if (idx === -1) return -1;
  if (queue[idx].status === 'running') return 0;
  return idx; // 0-indexed but the first queued item is position 1 (after the running one)
}

/**
 * Reset job store to seed data (useful for testing/demos).
 */
export function resetJobStore(): void {
  jobStore = [...localJobs];
}
