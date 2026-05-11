export interface S3Config {
  region: string;
  bucket: string;
  prefix: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface SFTPConfig {
  host: string;
  port: number;
  path: string;
  username?: string;
  password?: string;
}

export interface AzureBlobConfig {
  containerName: string;
  accountName: string;
  sasToken?: string;
}

export interface Connection {
  id: string;
  name: string;
  protocol: 'S3' | 'SFTP' | 'Azure Blob';
  status: 'connected' | 'error';
  basePath: string;
  accountId: string;
  config: S3Config | SFTPConfig | AzureBlobConfig;
}
