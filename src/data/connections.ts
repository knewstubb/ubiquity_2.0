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

  // Christchurch City Council
  {
    id: 'conn-ccc-rates',
    name: 'CCC Rates Database',
    protocol: 'SFTP',
    status: 'connected',
    basePath: '/data/rates/',
    config: {
      host: 'sftp.ccc.govt.nz',
      port: 22,
      path: '/data/rates/',
    },
  },

  // Save the Children NZ
  {
    id: 'conn-stc-donor',
    name: 'Donor Management System',
    protocol: 'S3',
    status: 'connected',
    basePath: '/donors/exports/',
    config: {
      region: 'ap-southeast-2',
      bucket: 'stc-nz-donor-data',
      prefix: 'donors/exports/',
    },
  },

  // Additional integrations — Serenity Spa
  {
    id: 'conn-spa-shopify',
    name: 'Shopify Product Sync',
    protocol: 'S3',
    status: 'connected',
    basePath: '/shopify/sync/',
    config: {
      region: 'ap-southeast-2',
      bucket: 'serenity-spa-shopify',
      prefix: 'shopify/sync/',
    },
  },
  {
    id: 'conn-spa-xero',
    name: 'Xero Accounting Export',
    protocol: 'SFTP',
    status: 'connected',
    basePath: '/xero/invoices/',
    config: {
      host: 'sftp.xero-integration.co.nz',
      port: 22,
      path: '/xero/invoices/',
    },
  },

  // Additional integrations — CCC
  {
    id: 'conn-ccc-library',
    name: 'Library Catalogue Sync',
    protocol: 'SFTP',
    status: 'connected',
    basePath: '/library/members/',
    config: {
      host: 'sftp.libraries.ccc.govt.nz',
      port: 22,
      path: '/library/members/',
    },
  },
  {
    id: 'conn-ccc-events',
    name: 'Eventfinda Integration',
    protocol: 'S3',
    status: 'connected',
    basePath: '/events/feed/',
    config: {
      region: 'ap-southeast-2',
      bucket: 'ccc-events-data',
      prefix: 'events/feed/',
    },
  },
  {
    id: 'conn-ccc-parks',
    name: 'Parks Booking System',
    protocol: 'Azure Blob',
    status: 'connected',
    basePath: '/bookings/',
    config: {
      accountName: 'cccparksdata',
      containerName: 'bookings',
    },
  },

  // Additional integrations — STC
  {
    id: 'conn-stc-salesforce',
    name: 'Salesforce CRM Sync',
    protocol: 'S3',
    status: 'connected',
    basePath: '/salesforce/contacts/',
    config: {
      region: 'ap-southeast-2',
      bucket: 'stc-nz-salesforce',
      prefix: 'salesforce/contacts/',
    },
  },
  {
    id: 'conn-stc-stripe',
    name: 'Stripe Donations Export',
    protocol: 'SFTP',
    status: 'connected',
    basePath: '/stripe/donations/',
    config: {
      host: 'sftp.savethechildren.org.nz',
      port: 22,
      path: '/stripe/donations/',
    },
  },
];
