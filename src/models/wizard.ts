import type { ExportDataType, TransactionalSource, SelectedField, FormatOptions, ScheduleFrequency, FileType } from './automation';
import type { FilterGroup } from './segment';
import type { SourceConfig } from './source-selection';
import type { FilterGroup as CardFilterGroup } from '../components/composed/filter-builder/types';

// --- Existing types ---

export interface ScheduleConfig {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  starting: string;
  every: string;
  at: string;
  weeklyDays: boolean[];
  monthlyPattern: 'day' | 'date';
  monthlyOrdinal: string;
  monthlyDayOfWeek: string;
  monthlyDates: string[];
}

export interface NotificationConfig {
  emails: string[];
  successEnabled: boolean;
  failureEnabled: boolean;
}

export interface WizardDraft {
  connectionId: string | null;
  name: string;
  dataType: ExportDataType | null;
  selectedSources?: ExportDataType[];
  transactionalSource: TransactionalSource | null;
  enrichmentKeyField: string | null;
  selectedFields: SelectedField[];
  fileType: FileType;
  formatOptions: FormatOptions;
  fileNamingPattern: string;
  schedule: ScheduleFrequency | null;
  scheduleConfig: ScheduleConfig;
  notifications: NotificationConfig;
  filters: FilterGroup;
}

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  delimiter: ',',
  includeHeader: true,
  dateFormat: 'ISO8601',
  timezone: 'UTC',
};

export const DEFAULT_FILTERS: FilterGroup = {
  combinator: 'AND',
  rules: [{ field: '', operator: '', value: '' }],
  groups: [],
};

export const DEFAULT_FILE_NAMING_PATTERN = '{connector_name}_{date}';

export const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  frequency: 'hourly',
  starting: 'Friday, 09 May, 2025',
  every: '1',
  at: '2:30 pm',
  weeklyDays: [false, true, true, false, true, false, false],
  monthlyPattern: 'day',
  monthlyOrdinal: '2nd',
  monthlyDayOfWeek: 'Wednesday',
  monthlyDates: ['1st', '8th', '15th'],
};

export const DEFAULT_NOTIFICATIONS: NotificationConfig = {
  emails: ['contact@gmail.com'],
  successEnabled: false,
  failureEnabled: true,
};

// --- New types for exporter wizard rework ---

export type ExporterType = 'contact_transactional' | 'event_based';

export type EventSource =
  | 'mailout_sends'
  | 'campaign_events'
  | 'failed_sends';

export interface ColumnRename {
  fieldKey: string;       // References SelectedField.key
  outputName: string;     // Custom column header (max 128 chars)
}

export interface ExporterScheduleConfig {
  frequency: '10_minute' | 'hourly' | 'daily' | 'weekly';
  weeklyDays: boolean[];           // 7 booleans, Mon–Sun
  monthlyDays: number[];           // 1–28
  // No time fields — system assigns execution time
}

export interface ExporterNotificationConfig {
  failureEmails: string[];          // Required, at least one
  successEnabled: boolean;
  successEmails: string[];
  noFileAlertEnabled?: boolean;     // Optional — used by importers
  noFileAlertEmails?: string[];     // Optional — used by importers
  noFileSchedule?: {                // Optional — schedule config for no-file alerts
    frequency: string;
    starting: string;
    every: string;
    at: string;
    weeklyDays?: boolean[];
    monthlyPattern?: 'day' | 'date';
    monthlyOrdinal?: string;
    monthlyDayOfWeek?: string;
    monthlyDates?: string[];
  };
}

export interface ExporterWizardDraft {
  // Identity
  connectionId: string | null;
  name: string;

  // Source selection (Step 0 — replaces exporterType + selectedSources + etc.)
  sourceConfig: SourceConfig | null;

  // Card-based filter builder state (persisted across step navigation)
  dataSourceFilter: CardFilterGroup | null;
  dataSourceMode: 'all_changes' | 'filtered' | 'mailout' | null;

  // --- Legacy fields (deprecated, kept for backward compat until migration tasks 6-13 complete) ---
  exporterType?: ExporterType | null;
  selectedSources?: ExportDataType[];
  transactionalSource?: TransactionalSource | null;
  filters?: FilterGroup;
  selectedEventSources?: EventSource[];

  // Field mapping
  selectedFields: SelectedField[];
  columnRenames: ColumnRename[];

  // File configuration
  fileNamingPrefix: string;
  destinationPath: string;
  formatOptions: FormatOptions;

  // Schedule
  schedule: ExporterScheduleConfig;

  // Notifications
  notifications: ExporterNotificationConfig;
}

export const DEFAULT_EXPORTER_DRAFT: ExporterWizardDraft = {
  connectionId: null,
  name: '',
  sourceConfig: null,
  dataSourceFilter: null,
  dataSourceMode: null,
  // Legacy fields (deprecated)
  exporterType: null,
  selectedSources: [],
  transactionalSource: null,
  filters: { combinator: 'AND', rules: [{ field: '', operator: '', value: '' }], groups: [] },
  selectedEventSources: [],
  selectedFields: [],
  columnRenames: [],
  fileNamingPrefix: '',
  destinationPath: '/exports/',
  formatOptions: {
    delimiter: ',',
    includeHeader: true,
    dateFormat: 'ISO8601',
    timezone: 'Pacific/Auckland',
  },
  schedule: {
    frequency: 'daily',
    weeklyDays: [false, false, false, false, false, false, false],
    monthlyDays: [],
  },
  notifications: {
    failureEmails: [],
    successEnabled: false,
    successEmails: [],
  },
};

export const EVENT_FIELDS: Record<EventSource, SelectedField[]> = {
  mailout_sends: [
    { key: 'event_timestamp', label: 'Event Timestamp', source: 'event' },
    { key: 'recipient_email', label: 'Recipient Email', source: 'event' },
    { key: 'mailout_name', label: 'Mailout Name', source: 'event' },
    { key: 'send_status', label: 'Send Status', source: 'event' },
    { key: 'open_count', label: 'Open Count', source: 'event' },
    { key: 'click_count', label: 'Click Count', source: 'event' },
  ],
  campaign_events: [
    { key: 'event_timestamp', label: 'Event Timestamp', source: 'event' },
    { key: 'recipient_email', label: 'Recipient Email', source: 'event' },
    { key: 'campaign_name', label: 'Campaign Name', source: 'event' },
    { key: 'channel', label: 'Channel', source: 'event' },
    { key: 'event_type', label: 'Event Type', source: 'event' },
  ],
  failed_sends: [
    { key: 'event_timestamp', label: 'Event Timestamp', source: 'event' },
    { key: 'recipient_email', label: 'Recipient Email', source: 'event' },
    { key: 'mailout_name', label: 'Mailout Name', source: 'event' },
    { key: 'failure_reason', label: 'Failure Reason', source: 'event' },
    { key: 'bounce_type', label: 'Bounce Type', source: 'event' },
  ],
};
