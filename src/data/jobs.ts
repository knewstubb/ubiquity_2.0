import type { Job } from '../models/job';

/**
 * Seed data for the job queue simulation.
 * Represents a realistic snapshot of what the job engine might look like at any moment.
 *
 * In production:
 * - All these jobs share a SINGLE THREAD (AccountLevel=Normal)
 * - Only one tick executes at a time across ALL accounts
 * - The "running" job is the one currently being ticked
 * - "queued" jobs wait behind it in round-robin order
 */
export const jobs: Job[] = [
  {
    id: 'job-import-001',
    accountId: 'acc-master',
    jobType: 'import',
    status: 'running',
    priority: 'low',
    progress: 67,
    parentJobId: null,
    metadata: {
      description: 'Importing contacts from spa-contacts-import.csv',
      totalItems: 1000,
      processedItems: 670,
      blockSize: 100,
      fileName: 'spa-contacts-import.csv',
    },
    createdAt: '2026-07-23T02:15:00Z',
    startedAt: '2026-07-23T02:15:05Z',
    completedAt: null,
    error: null,
  },
  {
    id: 'job-mailout-001',
    accountId: 'acc-master',
    jobType: 'mailout',
    status: 'queued',
    priority: 'normal',
    progress: 0,
    parentJobId: null,
    metadata: {
      description: 'Sending "July Newsletter" to Gold Members segment',
      totalItems: 450,
      processedItems: 0,
      blockSize: 50,
      campaignName: 'July Newsletter',
    },
    createdAt: '2026-07-23T02:16:00Z',
    startedAt: null,
    completedAt: null,
    error: null,
  },
  {
    id: 'job-download-001',
    accountId: 'acc-master',
    jobType: 'download',
    status: 'queued',
    priority: 'high',
    progress: 0,
    parentJobId: null,
    metadata: {
      description: 'Downloading filtered contact list (Platinum tier)',
      totalItems: 120,
      processedItems: 0,
      blockSize: 120,
    },
    createdAt: '2026-07-23T02:17:00Z',
    startedAt: null,
    completedAt: null,
    error: null,
  },
  {
    id: 'job-billing-001',
    accountId: 'acc-master',
    jobType: 'billing_collation',
    status: 'complete',
    priority: 'background',
    progress: 100,
    parentJobId: null,
    metadata: {
      description: 'Daily billing collation (all accounts)',
      totalItems: 12,
      processedItems: 12,
    },
    createdAt: '2026-07-23T04:30:00Z',
    startedAt: '2026-07-23T04:30:01Z',
    completedAt: '2026-07-23T04:32:15Z',
    error: null,
  },
  {
    id: 'job-export-001',
    accountId: 'acc-master',
    jobType: 'export',
    status: 'failed',
    priority: 'normal',
    progress: 23,
    parentJobId: null,
    metadata: {
      description: 'SFTP export to Brad\'s Connection',
      totalItems: 1000,
      processedItems: 230,
      blockSize: 100,
      fileName: 'contacts_export_2026-07-22.csv',
    },
    createdAt: '2026-07-22T18:00:00Z',
    startedAt: '2026-07-22T18:00:02Z',
    completedAt: '2026-07-22T18:01:45Z',
    error: 'Connection timeout: SFTP host unreachable after 30s',
  },
];
