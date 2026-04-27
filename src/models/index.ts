// Existing models
export type { Connection, S3Config, SFTPConfig, AzureBlobConfig } from './connection';
export type {
  Connector,
  SelectedField,
  FormatOptions,
  ConnectorStatus,
  ExportDataType,
  TransactionalSource,
  ScheduleFrequency,
  FileType,
} from './connector';
export type { ContactRecord, TreatmentRecord, ProductRecord } from './data';
export type { PathMode, ImportDataType, FilePathConfig, ImporterConfig } from './importer';
export { DEFAULT_FILE_PATH_CONFIG } from './importer';
export type { ScheduleConfig, NotificationConfig, WizardDraft } from './wizard';
export {
  DEFAULT_FORMAT_OPTIONS,
  DEFAULT_FILTERS,
  DEFAULT_FILE_NAMING_PATTERN,
  DEFAULT_SCHEDULE_CONFIG,
  DEFAULT_NOTIFICATIONS,
} from './wizard';

// New models
export type { Account } from './account';
export type { Contact, ActivityEvent } from './contact';
export type { Segment, FilterRule, FilterGroup } from './segment';
export type { Campaign, Journey, CampaignStatus, JourneyType } from './campaign';
export type { Asset } from './asset';
export type { Notification } from './notification';
