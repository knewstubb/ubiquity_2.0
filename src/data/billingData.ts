import type { BillingLineItem } from '../models/billing';
import { getCurrentBillingCycle } from '../models/billing';
import { accounts } from './accounts';
import { contacts } from './contacts';
import { transactionalDatabases } from './transactionalData';
import { connections } from './connections';
import { journeys } from './campaigns';
import { users } from './users';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `bill-${String(idCounter).padStart(3, '0')}`;
}

/** Deterministic pseudo-random based on a seed string (for reproducible data) */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 1000) / 1000;
}

/** Pick a user deterministically from a seed */
function seededUser(seed: string): string {
  const idx = Math.abs(
    seed.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0),
  ) % users.length;
  return users[idx].name;
}

/**
 * Generate a date string (YYYY-MM-DD) offset from a base date.
 * Useful for distributing dates across recent billing cycles.
 */
function offsetDate(base: Date, offsetDays: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

/** Get a date within the last ~90 days, seeded by a string */
function recentDate(seed: string): string {
  const now = new Date();
  const daysBack = Math.floor(seededRandom(seed) * 90);
  return offsetDate(now, -daysBack);
}

// ---------------------------------------------------------------------------
// All account IDs (leaf + parent)
// ---------------------------------------------------------------------------

const allAccountIds = accounts.map((a) => a.id);

// Leaf accounts are those with no children (or empty childIds)
const leafAccountIds = accounts
  .filter((a) => a.childIds.length === 0)
  .map((a) => a.id);

// ---------------------------------------------------------------------------
// 1. Database Records — one row per "database" per account
//    We treat each account as having a "Contacts" database.
//    Items = contact count distributed across accounts.
// ---------------------------------------------------------------------------

function generateDatabaseRecords(): BillingLineItem[] {
  const items: BillingLineItem[] = [];
  const cycle = getCurrentBillingCycle();

  // Distribute contacts across leaf accounts deterministically
  const contactsPerAccount: Record<string, number> = {};
  const totalContacts = contacts.length;

  // Give each leaf account a share of contacts
  leafAccountIds.forEach((accId, idx) => {
    const share = Math.max(
      2,
      Math.floor(totalContacts / leafAccountIds.length) + (idx < totalContacts % leafAccountIds.length ? 1 : 0),
    );
    contactsPerAccount[accId] = share;
  });

  // Also give parent accounts with no leaf-specific data a small database
  const parentAccountIds = accounts
    .filter((a) => a.childIds.length > 0)
    .map((a) => a.id);

  parentAccountIds.forEach((accId) => {
    contactsPerAccount[accId] = Math.floor(3 + seededRandom(accId + '-db') * 8);
  });

  // Generate one "Contacts Database" row per account
  for (const accId of allAccountIds) {
    const count = contactsPerAccount[accId] ?? 5;
    items.push({
      id: nextId(),
      accountId: accId,
      category: 'Database Records',
      description: 'Contacts Database',
      sendDate: null,
      items: count,
      createdDate: recentDate(accId + '-db-created'),
      user: seededUser(accId + '-db'),
      billingCycleStart: cycle.start,
      billingCycleEnd: cycle.end,
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// 2. Transactional Records — one row per connector (from transactionalData)
//    Each transactional database becomes a connector row per relevant account.
// ---------------------------------------------------------------------------

function generateTransactionalRecords(): BillingLineItem[] {
  const items: BillingLineItem[] = [];

  for (const tdb of transactionalDatabases) {
    // Group records by accountId
    const byAccount: Record<string, number> = {};
    for (const rec of tdb.records) {
      byAccount[rec.accountId] = (byAccount[rec.accountId] ?? 0) + 1;
    }

    // One row per account that has records in this transactional database
    for (const [accId, count] of Object.entries(byAccount)) {
      items.push({
        id: nextId(),
        accountId: accId,
        category: 'Transactional Records',
        description: `${tdb.name} Connector`,
        sendDate: null,
        items: count,
        createdDate: recentDate(accId + '-txn-' + tdb.id),
        user: seededUser(accId + '-txn-' + tdb.id),
      });
    }
  }

  // Also add transactional records for grandchild accounts (synthetic)
  const grandchildIds = ['acc-akl-cbd', 'acc-akl-newmarket', 'acc-wlg-cbd', 'acc-wlg-petone'];
  for (const accId of grandchildIds) {
    for (const tdb of transactionalDatabases) {
      const count = Math.floor(2 + seededRandom(accId + '-txn-' + tdb.id) * 5);
      items.push({
        id: nextId(),
        accountId: accId,
        category: 'Transactional Records',
        description: `${tdb.name} Connector`,
        sendDate: null,
        items: count,
        createdDate: recentDate(accId + '-txn-gc-' + tdb.id),
        user: seededUser(accId + '-txn-gc-' + tdb.id),
      });
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// 3. Mailouts — from journeys with type 'promotional'
//    One row per send (2–3 sends per journey)
// ---------------------------------------------------------------------------

function generateMailouts(): BillingLineItem[] {
  const items: BillingLineItem[] = [];
  const promoJourneys = journeys.filter((j) => j.type === 'promotional');

  for (const journey of promoJourneys) {
    const sendCount = 2 + Math.floor(seededRandom(journey.id + '-sends') * 2); // 2 or 3

    for (let s = 0; s < sendCount; s++) {
      const recipientCount = Math.max(
        50,
        Math.floor(200 + seededRandom(journey.id + `-send-${s}`) * 800),
      );
      const sendDate = recentDate(journey.id + `-send-${s}-date`);

      items.push({
        id: nextId(),
        accountId: journey.accountId,
        category: 'Mailouts',
        description: `${journey.name} — Send ${s + 1}`,
        sendDate,
        items: recipientCount,
        createdDate: recentDate(journey.id + `-send-${s}-created`),
        user: seededUser(journey.id + `-send-${s}`),
      });
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// 4. Automated Mailouts — from journeys with type 'welcome', 're-engagement',
//    or 'transactional'. One row per recurring send.
// ---------------------------------------------------------------------------

function generateAutomatedMailouts(): BillingLineItem[] {
  const items: BillingLineItem[] = [];
  const autoTypes = ['welcome', 're-engagement', 'transactional'];
  const autoJourneys = journeys.filter((j) => autoTypes.includes(j.type));

  for (const journey of autoJourneys) {
    const recipientCount = Math.max(
      10,
      Math.floor(journey.entryCount * (5 + seededRandom(journey.id + '-auto') * 20)),
    );
    const sendDate = recentDate(journey.id + '-auto-date');

    items.push({
      id: nextId(),
      accountId: journey.accountId,
      category: 'Automated Mailouts',
      description: `${journey.name} — Recurring`,
      sendDate,
      items: recipientCount,
      createdDate: recentDate(journey.id + '-auto-created'),
      user: seededUser(journey.id + '-auto'),
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// 5. Form Triggered Emails — synthetic, 2–3 per child account
// ---------------------------------------------------------------------------

function generateFormTriggeredEmails(): BillingLineItem[] {
  const items: BillingLineItem[] = [];

  // Child accounts (those with a parentId that is not null, excluding master)
  const childAccounts = accounts.filter((a) => a.parentId !== null);

  const formNames = [
    'Contact Us Form',
    'Booking Confirmation',
    'Feedback Survey',
    'Newsletter Signup',
    'Membership Enquiry',
  ];

  for (const acc of childAccounts) {
    const formCount = 2 + Math.floor(seededRandom(acc.id + '-forms') * 2); // 2 or 3

    for (let f = 0; f < formCount; f++) {
      const formName = formNames[
        Math.abs(acc.id.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) + f) %
          formNames.length
      ];
      const triggerCount = Math.max(
        5,
        Math.floor(10 + seededRandom(acc.id + `-form-${f}`) * 90),
      );
      const sendDate = recentDate(acc.id + `-form-${f}-date`);

      items.push({
        id: nextId(),
        accountId: acc.id,
        category: 'Form Triggered Emails',
        description: formName,
        sendDate,
        items: triggerCount,
        createdDate: recentDate(acc.id + `-form-${f}-created`),
        user: seededUser(acc.id + `-form-${f}`),
      });
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// 6. Integrations — one row per connection per account
// ---------------------------------------------------------------------------

function generateIntegrations(): BillingLineItem[] {
  const items: BillingLineItem[] = [];

  for (const acc of accounts) {
    for (const conn of connections) {
      const syncCount = Math.max(
        10,
        Math.floor(50 + seededRandom(acc.id + '-int-' + conn.id) * 200),
      );

      items.push({
        id: nextId(),
        accountId: acc.id,
        category: 'Integrations',
        description: `${conn.name} — ${conn.protocol}`,
        sendDate: null,
        items: syncCount,
        createdDate: recentDate(acc.id + '-int-' + conn.id + '-created'),
        user: seededUser(acc.id + '-int-' + conn.id),
      });
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// Assemble all billing line items
// ---------------------------------------------------------------------------

function generateBillingData(): BillingLineItem[] {
  // Reset counter for deterministic IDs
  idCounter = 0;

  return [
    ...generateDatabaseRecords(),
    ...generateTransactionalRecords(),
    ...generateMailouts(),
    ...generateAutomatedMailouts(),
    ...generateFormTriggeredEmails(),
    ...generateIntegrations(),
  ];
}

export const billingLineItems: BillingLineItem[] = generateBillingData();
