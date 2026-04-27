export type PathMode = 'automatic' | 'base' | 'custom';
export type ImportDataType = 'contact' | 'transactional' | 'both';

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
  notifications: Record<string, unknown>;
  contactConfig: Record<string, unknown>;
  contactMapping: Record<string, unknown>;
  transactionalConfig: Record<string, unknown>;
  transactionalMapping: Record<string, unknown>;
}

export const DEFAULT_FILE_PATH_CONFIG: FilePathConfig = {
  pathMode: 'automatic',
  folderName: '',
  readPath: '',
  errorFolderPath: '',
  archiveFolderPath: '',
  fileNamePattern: '',
};
