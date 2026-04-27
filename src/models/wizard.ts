import type { ExportDataType, TransactionalSource, SelectedField, FormatOptions, ScheduleFrequency, FileType } from './connector';
import type { FilterGroup } from './segment';

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
