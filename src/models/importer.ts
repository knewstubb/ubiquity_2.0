export type PathMode = 'automatic' | 'base' | 'custom';
export type ImportDataType = 'contact' | 'transactional' | 'both';
export type UpdateType = 'append-update' | 'append' | 'update';
export type BlankValueHandling = 'preserve' | 'import';
export type CsvDelimiter = 'comma' | 'tab' | 'pipe' | 'semicolon';
export type CsvEncoding = 'utf-8' | 'iso-8859-1' | 'windows-1252';

export interface CsvFormatConfig {
  delimiter: CsvDelimiter;
  encoding: CsvEncoding;
  hasHeaderRow: boolean;
}

export interface DedupeConfig {
  enabled: boolean;
  fields: string[];
}

export interface ContactConfig {
  updateType: UpdateType;
  blankValueHandling: BlankValueHandling;
  matchingFields: string[];
  dedupe: DedupeConfig;
}

export interface TransactionalConfig {
  updateType: UpdateType;
  blankValueHandling: BlankValueHandling;
  matchingFields: string[];
  dedupe: DedupeConfig;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
}

export interface LookupMapping {
  sourceField: string;
  contactField: string;
}

export interface NotificationConfig {
  failureEmails: string[];
  successEnabled: boolean;
  successEmails: string[];
  noFileAlertEnabled: boolean;
  noFileAlertEmails: string[];
}

export interface FilePathConfig {
  pathMode: PathMode;
  folderName: string;
  readPath: string;
  errorFolderPath: string;
  archiveFolderPath: string;
  fileNamePattern: string;
}

export interface ImportDefaultRow {
  targetField: string;
  mode: 'fixed' | 'send-date';
  fixedValue?: string;
  sendSchedule?: {
    days: number[]; // 0=Mon, 1=Tue, ..., 6=Sun
    includeTime: boolean;
    hours: string[]; // e.g. ["05:00", "09:00"]
    activePeriodsOnly: boolean;
    avoidHolidays: boolean;
  };
}

export interface ImporterConfig {
  connectionId: string;
  name: string;
  dataType: ImportDataType | null;
  filePathConfig: FilePathConfig;
  csvFormat: CsvFormatConfig;
  notifications: NotificationConfig;
  contactConfig: ContactConfig;
  contactMapping: FieldMapping[];
  transactionalConfig: TransactionalConfig;
  transactionalMapping: FieldMapping[];
  transactionalTable?: string;
  csvHeaders?: string[];
  csvExampleValues?: Record<string, string>;
  lookupMappings?: LookupMapping[];
  importDefaults?: ImportDefaultRow[];
}

export const DEFAULT_CONTACT_CONFIG: ContactConfig = {
  updateType: 'append-update',
  blankValueHandling: 'preserve',
  matchingFields: ['Email', 'Customer ID'],
  dedupe: { enabled: false, fields: [] },
};

export const DEFAULT_TRANSACTIONAL_CONFIG: TransactionalConfig = {
  updateType: 'append-update',
  blankValueHandling: 'preserve',
  matchingFields: ['Customer ID'],
  dedupe: { enabled: false, fields: [] },
};

export const DEFAULT_CSV_FORMAT_CONFIG: CsvFormatConfig = {
  delimiter: 'comma',
  encoding: 'utf-8',
  hasHeaderRow: true,
};

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  failureEmails: [],
  successEnabled: false,
  successEmails: [],
  noFileAlertEnabled: false,
  noFileAlertEmails: [],
};

export const DEFAULT_FILE_PATH_CONFIG: FilePathConfig = {
  pathMode: 'automatic',
  folderName: '',
  readPath: '',
  errorFolderPath: '',
  archiveFolderPath: '',
  fileNamePattern: '',
};

export const CONTACT_LOOKUP_FIELDS = [
  'Email',
  'Customer ID',
  'Phone',
  'External ID',
  'Account Number',
];
