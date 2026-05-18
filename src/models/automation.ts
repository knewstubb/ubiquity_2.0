import type { FilterGroup } from './segment';
import type { ImporterConfig } from './importer';
import type { NotificationConfig as ExporterNotificationConfig, ScheduleConfig } from './wizard';

export type ExportDataType =
  | 'contact'
  | 'transactional'
  | 'transactional_with_contact';

export type TransactionalSource = 'treatments' | 'products';

export type ScheduleFrequency =
  | 'every_15_min'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly';

export type AutomationStatus = 'active' | 'paused';

export type FileType = 'csv' | 'json' | 'xml';

export interface FormatOptions {
  delimiter: ',' | '|' | '\t' | ';';
  includeHeader: boolean;
  dateFormat: 'ISO8601' | 'US' | 'EU' | 'UNIX';
  timezone: string; // IANA timezone string, default 'UTC'
}

export interface SelectedField {
  key: string;       // Field identifier (e.g., 'firstName', 'treatmentType')
  label: string;     // Display name (e.g., 'First Name', 'Treatment Type')
  source: 'contact' | 'treatment' | 'product'; // Which dataset this field comes from
}

export interface Automation {
  id: string;                          // UUID
  connectionId: string;                // Parent connection reference
  name: string;                        // User-provided name
  direction: 'import' | 'export';       // Import or export automation
  dataType: ExportDataType;
  transactionalSource?: TransactionalSource; // Required when dataType includes transactional
  enrichmentKeyField?: string;         // Key field on transactional side for enrichment join
  selectedFields: SelectedField[];     // Ordered list of selected fields
  fileType: FileType;                  // Output file format
  formatOptions: FormatOptions;
  fileNamingPattern: string;           // e.g., '{connector_name}_{date}_{timestamp}'
  schedule: ScheduleFrequency;
  filters: FilterGroup;                 // Dynamic rule-based filter group
  status: AutomationStatus;
  createdAt: string;                   // ISO timestamp
  updatedAt: string;                   // ISO timestamp
  importerConfig?: ImporterConfig;     // Present when direction === 'import'
  notifications?: ExporterNotificationConfig; // Present when direction === 'export'
  scheduleConfig?: ScheduleConfig;     // Full schedule details (frequency, time, days, etc.)
}
