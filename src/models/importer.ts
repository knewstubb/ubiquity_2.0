export type PathMode = 'automatic' | 'base' | 'custom';
export type ImportDataType = 'contact' | 'transactional' | 'both';
export type UpdateType = 'append-update' | 'append' | 'update';
export type BlankValueHandling = 'preserve' | 'import';

export interface ContactConfig {
  updateType: UpdateType;
  blankValueHandling: BlankValueHandling;
  matchingFields: string[];
}

export interface TransactionalConfig {
  updateType: UpdateType;
  blankValueHandling: BlankValueHandling;
  matchingFields: string[];
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

export interface ImporterConfig {
  connectionId: string;
  name: string;
  dataType: ImportDataType | null;
  filePathConfig: FilePathConfig;
  notifications: NotificationConfig;
  contactConfig: ContactConfig;
  contactMapping: FieldMapping[];
  transactionalConfig: TransactionalConfig;
  transactionalMapping: FieldMapping[];
  csvHeaders?: string[];
  csvExampleValues?: Record<string, string>;
  lookupMappings?: LookupMapping[];
}

export const DEFAULT_CONTACT_CONFIG: ContactConfig = {
  updateType: 'append-update',
  blankValueHandling: 'preserve',
  matchingFields: ['Email', 'Customer ID'],
};

export const DEFAULT_TRANSACTIONAL_CONFIG: TransactionalConfig = {
  updateType: 'append-update',
  blankValueHandling: 'preserve',
  matchingFields: ['Customer ID'],
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
