import fc from 'fast-check';
import type { Campaign, Journey, JourneyType, CampaignStatus } from '../models/campaign';
import type { Connection } from '../models/connection';
import type { Connector, ExportDataType, TransactionalSource, ScheduleFrequency, ConnectorStatus, FileType, FormatOptions, SelectedField } from '../models/connector';
import type { Contact } from '../models/contact';
import type { ContactRecord } from '../models/data';
import type { Segment, FilterGroup, FilterRule } from '../models/segment';
import type { Asset, AssetType, AssetScope } from '../models/asset';
import type { FeedbackComment } from '../contexts/FeedbackContext';
import type { SessionState, SimulatedRole } from '../lib/session-store';
import type { ChangelogEntry } from '../contexts/ChangelogContext';
import type { FeatureFlag } from '../contexts/FeatureFlagContext';

// --- Shared helpers ---

/** Generates a realistic ISO 8601 timestamp string */
export function arbISOTimestamp(): fc.Arbitrary<string> {
  const minMs = new Date('2023-01-01T00:00:00Z').getTime();
  const maxMs = new Date('2025-12-31T23:59:59Z').getTime();
  return fc.integer({ min: minMs, max: maxMs }).map((ms) => new Date(ms).toISOString());
}

// --- Constants ---

const JOURNEY_TYPES: JourneyType[] = ['welcome', 're-engagement', 'transactional', 'promotional'];
const CAMPAIGN_STATUSES: CampaignStatus[] = ['draft', 'active', 'paused', 'completed'];
const ACCOUNT_IDS = ['acc-master', 'acc-auckland', 'acc-wellington', 'acc-christchurch', 'acc-queenstown'];

export function arbJourneyType(): fc.Arbitrary<JourneyType> {
  return fc.constantFrom(...JOURNEY_TYPES);
}

export function arbAccountId(): fc.Arbitrary<string> {
  return fc.constantFrom(...ACCOUNT_IDS);
}

export function arbCampaign(): fc.Arbitrary<Campaign> {
  return fc.record({
    id: fc.uuid().map((u) => `cmp-${u}`),
    name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    accountId: arbAccountId(),
    goal: fc.string({ maxLength: 100 }),
    dateRange: fc.record({
      start: fc.constant('2024-01-01'),
      end: fc.constant('2025-12-31'),
    }),
    status: fc.constantFrom(...CAMPAIGN_STATUSES),
    journeyIds: fc.array(fc.uuid().map((u) => `jrn-${u}`), { maxLength: 5 }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 3 }),
  });
}

export function arbJourney(campaignId?: string): fc.Arbitrary<Journey> {
  return fc.record({
    id: fc.uuid().map((u) => `jrn-${u}`),
    name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    campaignId: campaignId ? fc.constant(campaignId) : fc.uuid().map((u) => `cmp-${u}`),
    accountId: arbAccountId(),
    status: fc.constantFrom(...CAMPAIGN_STATUSES),
    nodeCount: fc.nat({ max: 20 }),
    entryCount: fc.nat({ max: 1000 }),
    type: arbJourneyType(),
  });
}

// --- Connection ---

const CONNECTION_PROTOCOLS: Connection['protocol'][] = ['S3', 'SFTP', 'Azure Blob'];
const CONNECTION_STATUSES: Connection['status'][] = ['connected', 'error'];

export function arbConnection(): fc.Arbitrary<Connection> {
  return fc.record({
    id: fc.uuid().map((u) => `conn-${u}`),
    name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    protocol: fc.constantFrom(...CONNECTION_PROTOCOLS),
    status: fc.constantFrom(...CONNECTION_STATUSES),
    basePath: fc.string({ maxLength: 100 }),
    config: fc.record({
      region: fc.string({ minLength: 1, maxLength: 20 }),
      bucket: fc.string({ minLength: 1, maxLength: 30 }),
      prefix: fc.string({ maxLength: 30 }),
    }),
  });
}

// --- Connector ---

const EXPORT_DATA_TYPES: ExportDataType[] = ['contact', 'transactional', 'transactional_with_contact'];
const TRANSACTIONAL_SOURCES: TransactionalSource[] = ['treatments', 'products'];
const SCHEDULE_FREQUENCIES: ScheduleFrequency[] = ['every_15_min', 'hourly', 'daily', 'weekly', 'monthly'];
const CONNECTOR_STATUSES: ConnectorStatus[] = ['active', 'paused'];
const FILE_TYPES: FileType[] = ['csv', 'json', 'xml'];
const DELIMITERS: FormatOptions['delimiter'][] = [',', '|', '\t', ';'];
const DATE_FORMATS: FormatOptions['dateFormat'][] = ['ISO8601', 'US', 'EU', 'UNIX'];

export function arbFormatOptions(): fc.Arbitrary<FormatOptions> {
  return fc.record({
    delimiter: fc.constantFrom(...DELIMITERS),
    includeHeader: fc.boolean(),
    dateFormat: fc.constantFrom(...DATE_FORMATS),
    timezone: fc.constant('UTC'),
  });
}

export function arbSelectedField(): fc.Arbitrary<SelectedField> {
  return fc.record({
    key: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    label: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0),
    source: fc.constantFrom('contact' as const, 'treatment' as const, 'product' as const),
  });
}

export function arbFilterRule(): fc.Arbitrary<FilterRule> {
  return fc.record({
    field: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    operator: fc.constantFrom('equals', 'contains', 'greaterThan', 'lessThan'),
    value: fc.string({ minLength: 1, maxLength: 30 }),
  });
}

export function arbFilterGroup(): fc.Arbitrary<FilterGroup> {
  return fc.record({
    combinator: fc.constantFrom('AND' as const, 'OR' as const),
    rules: fc.array(arbFilterRule(), { maxLength: 3 }),
    groups: fc.constant([] as FilterGroup[]),
  });
}

export function arbConnector(): fc.Arbitrary<Connector> {
  return fc.record({
    id: fc.uuid().map((u) => `cntr-${u}`),
    connectionId: fc.uuid().map((u) => `conn-${u}`),
    name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    direction: fc.constant('export' as const),
    dataType: fc.constantFrom(...EXPORT_DATA_TYPES),
    transactionalSource: fc.option(fc.constantFrom(...TRANSACTIONAL_SOURCES), { nil: undefined }),
    enrichmentKeyField: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
    selectedFields: fc.array(arbSelectedField(), { maxLength: 5 }),
    fileType: fc.constantFrom(...FILE_TYPES),
    formatOptions: arbFormatOptions(),
    fileNamingPattern: fc.constant('{connector_name}_{date}_{timestamp}'),
    schedule: fc.constantFrom(...SCHEDULE_FREQUENCIES),
    filters: arbFilterGroup(),
    status: fc.constantFrom(...CONNECTOR_STATUSES),
    createdAt: arbISOTimestamp(),
    updatedAt: arbISOTimestamp(),
  });
}

// --- Contact ---

const MEMBERSHIP_TIERS: ContactRecord['membershipTier'][] = ['Bronze', 'Silver', 'Gold', 'Platinum'];

export function arbContactRecord(): fc.Arbitrary<ContactRecord> {
  return fc.record({
    id: fc.uuid().map((u) => `ct-${u}`),
    firstName: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    lastName: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    email: fc.emailAddress(),
    phone: fc.string({ minLength: 5, maxLength: 15 }),
    membershipTier: fc.constantFrom(...MEMBERSHIP_TIERS),
    joinDate: fc.constant('2024-01-15'),
    communicationPreferences: fc.record({
      email: fc.boolean(),
      sms: fc.boolean(),
      push: fc.boolean(),
    }),
  });
}

export function arbContact(): fc.Arbitrary<Contact> {
  return arbContactRecord().chain((base) =>
    fc.record({
      accountId: arbAccountId(),
      segmentIds: fc.array(fc.uuid().map((u) => `seg-${u}`), { maxLength: 3 }),
      journeyIds: fc.array(fc.uuid().map((u) => `jrn-${u}`), { maxLength: 3 }),
      activityTimeline: fc.array(
        fc.record({
          id: fc.uuid(),
          type: fc.constantFrom('purchase' as const, 'visit' as const, 'email_open' as const, 'form_submit' as const, 'journey_enter' as const),
          description: fc.string({ minLength: 1, maxLength: 60 }),
          timestamp: arbISOTimestamp(),
        }),
        { maxLength: 5 },
      ),
    }).map((ext) => ({ ...base, ...ext })),
  );
}

// --- Segment ---

export function arbSegment(): fc.Arbitrary<Segment> {
  return fc.record({
    id: fc.uuid().map((u) => `seg-${u}`),
    name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    accountId: arbAccountId(),
    type: fc.constantFrom('smart' as const, 'manual' as const),
    rootGroup: arbFilterGroup(),
    memberCount: fc.nat({ max: 10000 }),
  });
}

// --- Asset ---

const ASSET_TYPES: AssetType[] = ['image', 'colour', 'font', 'footer'];
const ASSET_SCOPES: AssetScope[] = ['global', 'campaign', 'account'];

export function arbAsset(): fc.Arbitrary<Asset> {
  return fc.record({
    id: fc.uuid().map((u) => `ast-${u}`),
    name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    type: fc.constantFrom(...ASSET_TYPES),
    scope: fc.constantFrom(...ASSET_SCOPES),
    accountId: arbAccountId(),
    campaignId: fc.option(fc.uuid().map((u) => `cmp-${u}`), { nil: null }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
    createdAt: arbISOTimestamp(),
    colourValue: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }).map((h) => `#${h}`), { nil: undefined }),
  });
}

// --- FeedbackComment ---

export function arbFeedbackComment(): fc.Arbitrary<FeedbackComment> {
  return fc.record({
    id: fc.uuid(),
    pageRoute: fc.constantFrom('/dashboard', '/automations/campaigns', '/audiences/segments', '/content/assets', '/settings'),
    userId: fc.uuid(),
    userDisplayName: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0),
    body: fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
    createdAt: arbISOTimestamp(),
  });
}

// --- SessionState ---

const SIMULATED_ROLES: SimulatedRole[] = ['admin', 'marketer', 'viewer'];

export function arbSimulatedRole(): fc.Arbitrary<SimulatedRole> {
  return fc.constantFrom(...SIMULATED_ROLES);
}

export function arbSessionState(): fc.Arbitrary<SessionState> {
  return fc.record({
    selectedAccountId: arbAccountId(),
    activeFilters: fc.record({
      segmentFilters: fc.option(arbFilterGroup(), { nil: undefined }),
      campaignTags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 3 }), { nil: undefined }),
      assetTypeFilter: fc.option(fc.constantFrom('image', 'colour', 'font', 'footer'), { nil: undefined }),
    }),
    openPanels: fc.array(fc.constantFrom('feedback', 'inspector', 'whats-new', 'settings'), { maxLength: 3 }),
    simulatedRole: arbSimulatedRole(),
    lastRoute: fc.constantFrom('/dashboard', '/automations/campaigns', '/audiences/segments', '/content/assets', '/settings'),
  });
}

// --- ChangelogEntry ---

export function arbChangelogEntry(): fc.Arbitrary<ChangelogEntry> {
  return fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0),
    description: fc.string({ maxLength: 300 }),
    affectedRoutes: fc.array(
      fc.constantFrom('/dashboard', '/automations/campaigns', '/audiences/segments', '/content/assets', '/settings'),
      { maxLength: 4 },
    ),
    createdAt: arbISOTimestamp(),
  });
}

// --- ActivityEvent (activity log) ---

export interface ActivityEventShape {
  pageRoute: string;
  interactionType?: string;
  targetId?: string;
  timestamp: string;
  userId: string;
}

export function arbActivityEvent(): fc.Arbitrary<ActivityEventShape> {
  return fc.record({
    pageRoute: fc.constantFrom('/dashboard', '/automations/campaigns', '/audiences/segments', '/content/assets', '/settings'),
    interactionType: fc.option(fc.constantFrom('modal_open', 'record_create', 'filter_apply', 'button_click'), { nil: undefined }),
    targetId: fc.option(fc.uuid(), { nil: undefined }),
    timestamp: arbISOTimestamp(),
    userId: fc.uuid(),
  });
}

// --- FeatureFlag ---

export function arbFeatureFlag(): fc.Arbitrary<FeatureFlag> {
  return fc.record({
    name: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0 && /^[a-zA-Z0-9_-]+$/.test(s)),
    enabled: fc.boolean(),
    description: fc.string({ maxLength: 200 }),
    scope: fc.constantFrom('page' as const, 'component' as const),
    target: fc.constantFrom('/dashboard', '/automations/campaigns', '/audiences/segments', '/content/assets', '/settings', 'feedback-widget', 'role-simulator'),
  });
}

export {
  JOURNEY_TYPES,
  CAMPAIGN_STATUSES,
  ACCOUNT_IDS,
  CONNECTION_PROTOCOLS,
  CONNECTION_STATUSES,
  MEMBERSHIP_TIERS,
  ASSET_TYPES,
  ASSET_SCOPES,
  SIMULATED_ROLES,
};
