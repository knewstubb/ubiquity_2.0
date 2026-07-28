import { FeatureState } from '../models/featureFlag';
import type { FeatureFlag, AccountFeature } from '../models/featureFlag';

/**
 * Seed data for feature flags.
 * Mirrors the real dbo.Feature table in u3_system.
 *
 * Real production flags (as of June 2026):
 * - Connectors (1): Live, enabled globally
 * - SignedTracking (2): In rollout
 * - ConnectionManagement (3): Live, enabled globally
 * - InMemoryImportStaging (4): Internal, percentage rollout
 */
export const featureFlags: FeatureFlag[] = [
  {
    id: 'ff-connectors',
    name: 'Connectors',
    description: 'Data import/export connectors (S3, SFTP, Azure Blob)',
    state: FeatureState.EnabledGlobally,
    rolloutPercentage: 100,
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2026-05-21T00:00:00Z',
  },
  {
    id: 'ff-signed-tracking',
    name: 'SignedTracking',
    description: 'Signed personalised links for forms, surveys, and events in emails',
    state: FeatureState.Enabled,
    rolloutPercentage: 50,
    createdAt: '2026-03-14T00:00:00Z',
    updatedAt: '2026-03-14T00:00:00Z',
  },
  {
    id: 'ff-connection-management',
    name: 'ConnectionManagement',
    description: 'Unified connection management UI for connectors',
    state: FeatureState.EnabledGlobally,
    rolloutPercentage: 100,
    createdAt: '2026-05-21T00:00:00Z',
    updatedAt: '2026-05-21T00:00:00Z',
  },
  {
    id: 'ff-in-memory-import',
    name: 'InMemoryImportStaging',
    description: 'Use in-memory OLTP for import scratch tables instead of u3_data_scratch',
    state: FeatureState.Enabled,
    rolloutPercentage: 25,
    createdAt: '2026-05-12T00:00:00Z',
    updatedAt: '2026-05-12T00:00:00Z',
  },
  {
    id: 'ff-journey-builder',
    name: 'JourneyBuilder',
    description: 'Visual journey/workflow builder for campaign automation',
    state: FeatureState.Enabled,
    rolloutPercentage: 0,
    createdAt: '2026-02-04T00:00:00Z',
    updatedAt: '2026-02-04T00:00:00Z',
  },
  {
    id: 'ff-smart-segments',
    name: 'SmartSegments',
    description: 'AI-powered affinity-based audience segmentation (PAUSED)',
    state: FeatureState.Disabled,
    rolloutPercentage: 0,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-17T00:00:00Z',
  },
  {
    id: 'ff-platform-filter-builder',
    name: 'PlatformFilterBuilder',
    description: 'New AST-based filter builder for the Next.js stack',
    state: FeatureState.Disabled,
    rolloutPercentage: 0,
    createdAt: '2026-06-20T00:00:00Z',
    updatedAt: '2026-06-20T00:00:00Z',
  },
  {
    id: 'ff-account-sync',
    name: 'AccountSync',
    description: 'Cross-account contact/transaction synchronisation via CDC pipeline',
    state: FeatureState.Enabled,
    rolloutPercentage: 0,
    createdAt: '2026-06-18T00:00:00Z',
    updatedAt: '2026-06-18T00:00:00Z',
  },
];

/**
 * Per-account overrides.
 * In production, these are rows in u3_system.dbo.AccountFeature.
 *
 * Example: JourneyBuilder is at 0% rollout globally, but explicitly
 * enabled for our test account so the prototype can demonstrate it.
 */
export const accountFeatures: AccountFeature[] = [
  {
    accountId: 'acc-master',
    featureId: 'ff-journey-builder',
    isEnabled: true,
  },
  {
    accountId: 'acc-master',
    featureId: 'ff-platform-filter-builder',
    isEnabled: true,
  },
  {
    accountId: 'acc-master',
    featureId: 'ff-account-sync',
    isEnabled: true,
  },
  // Acme Corp feature flags
  {
    accountId: 'acc-acme',
    featureId: 'ff-account-sync',
    isEnabled: true,
  },
  {
    accountId: 'acc-acme',
    featureId: 'ff-journey-builder',
    isEnabled: true,
  },
];
