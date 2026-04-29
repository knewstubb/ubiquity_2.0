import type { Connection } from '../models/connection';

export const connections: Connection[] = [
  // --- Serenity Spa Group (acc-master) — 4 connections ---
  {
    id: 'c1a2b3d4-e5f6-7890-abcd-ef1234567801',
    name: 'Spa AWS S3 Bucket',
    protocol: 'S3',
    status: 'connected',
    basePath: '/data/outbound/',
    accountId: 'acc-master',
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
    accountId: 'acc-master',
    config: {
      host: 'sftp.serenity-spa.com',
      port: 22,
      path: '/uploads/exports/',
    },
  },
  {
    id: 'conn-spa-blob',
    name: 'Spa Azure Blob Storage',
    protocol: 'Azure Blob',
    status: 'connected',
    basePath: '/spa-data/',
    accountId: 'acc-master',
    config: {
      accountName: 'serenityspastore',
      containerName: 'spa-data',
    },
  },
  {
    id: 'conn-spa-s3-broken',
    name: 'Spa Legacy S3 Import',
    protocol: 'S3',
    status: 'error',
    basePath: '/legacy/imports/',
    accountId: 'acc-master',
    config: {
      region: 'ap-southeast-2',
      bucket: 'serenity-spa-legacy',
      prefix: 'legacy/imports/',
    },
  },

  // --- Serenity Spa Auckland (acc-auckland) ---
  {
    id: 'conn-spa-shopify',
    name: 'Shopify Product Sync',
    protocol: 'S3',
    status: 'connected',
    basePath: '/shopify/sync/',
    accountId: 'acc-auckland',
    config: {
      region: 'ap-southeast-2',
      bucket: 'serenity-spa-shopify',
      prefix: 'shopify/sync/',
    },
  },

  // --- Serenity Spa Wellington (acc-wellington) ---
  {
    id: 'conn-spa-xero',
    name: 'Xero Accounting Export',
    protocol: 'SFTP',
    status: 'connected',
    basePath: '/xero/invoices/',
    accountId: 'acc-wellington',
    config: {
      host: 'sftp.xero-integration.co.nz',
      port: 22,
      path: '/xero/invoices/',
    },
  },

  // --- Christchurch City Council (acc-ccc) ---
  {
    id: 'conn-ccc-rates',
    name: 'CCC Rates Database',
    protocol: 'SFTP',
    status: 'connected',
    basePath: '/data/rates/',
    accountId: 'acc-ccc',
    config: {
      host: 'sftp.ccc.govt.nz',
      port: 22,
      path: '/data/rates/',
    },
  },
  {
    id: 'conn-ccc-events',
    name: 'Eventfinda Integration',
    protocol: 'S3',
    status: 'connected',
    basePath: '/events/feed/',
    accountId: 'acc-ccc',
    config: {
      region: 'ap-southeast-2',
      bucket: 'ccc-events-data',
      prefix: 'events/feed/',
    },
  },

  // --- CCC Libraries (acc-ccc-libraries) ---
  {
    id: 'conn-ccc-library',
    name: 'Library Catalogue Sync',
    protocol: 'SFTP',
    status: 'connected',
    basePath: '/library/members/',
    accountId: 'acc-ccc-libraries',
    config: {
      host: 'sftp.libraries.ccc.govt.nz',
      port: 22,
      path: '/library/members/',
    },
  },

  // --- CCC Parks (acc-ccc-parks) ---
  {
    id: 'conn-ccc-parks',
    name: 'Parks Booking System',
    protocol: 'Azure Blob',
    status: 'connected',
    basePath: '/bookings/',
    accountId: 'acc-ccc-parks',
    config: {
      accountName: 'cccparksdata',
      containerName: 'bookings',
    },
  },

  // --- Save the Children NZ (acc-stc) ---
  {
    id: 'conn-stc-donor',
    name: 'Donor Management System',
    protocol: 'S3',
    status: 'connected',
    basePath: '/donors/exports/',
    accountId: 'acc-stc',
    config: {
      region: 'ap-southeast-2',
      bucket: 'stc-nz-donor-data',
      prefix: 'donors/exports/',
    },
  },

  // --- STC Fundraising (acc-stc-fundraising) ---
  {
    id: 'conn-stc-salesforce',
    name: 'Salesforce CRM Sync',
    protocol: 'S3',
    status: 'connected',
    basePath: '/salesforce/contacts/',
    accountId: 'acc-stc-fundraising',
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
    accountId: 'acc-stc-fundraising',
    config: {
      host: 'sftp.savethechildren.org.nz',
      port: 22,
      path: '/stripe/donations/',
    },
  },
];
