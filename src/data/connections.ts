import type { Connection } from '../models/connection';

export const connections: Connection[] = [
  {
    id: 'c1a2b3d4-e5f6-7890-abcd-ef1234567801',
    name: 'Spa AWS S3 Bucket',
    protocol: 'S3',
    status: 'connected',
    basePath: '/data/outbound/',
    config: {
      region: 'us-east-1',
      bucket: 'serenity-spa-exports',
      prefix: 'data/outbound/',
    },
  },
  {
    id: 'c9b8a7d6-e5f4-3210-abcd-ef9876543210',
    name: 'Spa SFTP Server',
    protocol: 'SFTP',
    status: 'connected',
    basePath: '/uploads/exports/',
    config: {
      host: 'sftp.serenity-spa.com',
      port: 22,
      path: '/uploads/exports/',
    },
  },
];
