import type { BillingLineItem } from '../models/billing';
import { getCurrentBillingCycle } from '../models/billing';
import { accounts } from './accounts';
import { contacts } from './contacts';
import { transactionalDatabases } from './transactionalData';
import { connections } from './connections';
import { connectors } from './connectors';
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

/** Get a date within the last ~30 days, seeded by a string */
function recentSendDate(seed: string): string {
  const now = new Date();
  const daysBack = Math.floor(seededRandom(seed) * 30);
  return offsetDate(now, -daysBack);
}

// ---------------------------------------------------------------------------
// All account IDs
// ---------------------------------------------------------------------------

const allAccountIds = accounts.map((a) => a.id);

const leafAccountIds = accounts
  .filter((a) => a.childIds.length === 0)
  .map((a) => a.id);

// ---------------------------------------------------------------------------
// 1. Database Records — realistic contact counts per account
//    Matches CSV pattern: "Contacts Database" with contact count
// ---------------------------------------------------------------------------

function generateDatabaseRecords(): BillingLineItem[] {
  const items: BillingLineItem[] = [];
  const cycle = getCurrentBillingCycle();

  // Realistic contact counts per account tier
  const contactCounts: Record<string, number> = {
    // Serenity Spa Group — large parent
    'acc-master': 12450,
    'acc-auckland': 4280,
    'acc-wellington': 2890,
    'acc-christchurch': 1650,
    'acc-queenstown': 890,
    'acc-akl-cbd': 2150,
    'acc-akl-newmarket': 1340,
    'acc-wlg-cbd': 1680,
    'acc-wlg-petone': 720,
    // CCC — large org
    'acc-ccc': 45200,
    'acc-ccc-parks': 8400,
    'acc-ccc-libraries': 15600,
    'acc-ccc-turanga': 9200,
    'acc-ccc-south-lib': 4800,
    'acc-ccc-events': 12300,
    // STC — medium org
    'acc-stc': 28500,
    'acc-stc-fundraising': 18200,
    'acc-stc-programmes': 6400,
    'acc-stc-early': 2100,
    'acc-stc-youth': 3500,
    'acc-stc-comms': 22800,
  };

  for (const accId of allAccountIds) {
    const count = contactCounts[accId] ?? Math.floor(500 + seededRandom(accId + '-db') * 2000);
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
// 2. Transactional Records — from transactional databases
// ---------------------------------------------------------------------------

function generateTransactionalRecords(): BillingLineItem[] {
  const items: BillingLineItem[] = [];

  for (const tdb of transactionalDatabases) {
    const byAccount: Record<string, number> = {};
    for (const rec of tdb.records) {
      byAccount[rec.accountId] = (byAccount[rec.accountId] ?? 0) + 1;
    }

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

  // Grandchild accounts (synthetic)
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
// 3. Mailouts — from promotional journeys, multiple sends each
// ---------------------------------------------------------------------------

function generateMailouts(): BillingLineItem[] {
  const items: BillingLineItem[] = [];
  const promoJourneys = journeys.filter((j) => j.type === 'promotional');

  for (const journey of promoJourneys) {
    const sendCount = 2 + Math.floor(seededRandom(journey.id + '-sends') * 2);

    for (let s = 0; s < sendCount; s++) {
      const recipientCount = Math.max(
        50,
        Math.floor(200 + seededRandom(journey.id + `-send-${s}`) * 800),
      );
      const sendDate = recentSendDate(journey.id + `-send-${s}-date`);

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
// 4. Automated Mailouts — from welcome, re-engagement, transactional journeys
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
    const sendDate = recentSendDate(journey.id + '-auto-date');

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
// 5. Form Triggered Emails — 2–3 per child account
// ---------------------------------------------------------------------------

function generateFormTriggeredEmails(): BillingLineItem[] {
  const items: BillingLineItem[] = [];
  const childAccounts = accounts.filter((a) => a.parentId !== null);

  const formNames = [
    'Contact Us Form',
    'Booking Confirmation',
    'Feedback Survey',
    'Newsletter Signup',
    'Membership Enquiry',
  ];

  for (const acc of childAccounts) {
    const formCount = 2 + Math.floor(seededRandom(acc.id + '-forms') * 2);

    for (let f = 0; f < formCount; f++) {
      const formName = formNames[
        Math.abs(acc.id.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) + f) %
          formNames.length
      ];
      const triggerCount = Math.max(
        5,
        Math.floor(10 + seededRandom(acc.id + `-form-${f}`) * 90),
      );
      const sendDate = recentSendDate(acc.id + `-form-${f}-date`);

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
// 6. TXT Message Parts — SMS sends for select accounts
// ---------------------------------------------------------------------------

function generateTxtMessageParts(): BillingLineItem[] {
  const items: BillingLineItem[] = [];

  // Only some accounts use SMS
  const smsAccounts = [
    { accId: 'acc-master', campaigns: ['Appointment Reminder SMS', 'Loyalty Points Update'] },
    { accId: 'acc-auckland', campaigns: ['Auckland Promo SMS'] },
    { accId: 'acc-ccc', campaigns: ['Rates Due Reminder SMS', 'Event Alert SMS'] },
    { accId: 'acc-stc-fundraising', campaigns: ['Donation Thank You SMS'] },
  ];

  for (const { accId, campaigns } of smsAccounts) {
    for (const campaignName of campaigns) {
      const parts = Math.floor(50 + seededRandom(accId + '-sms-' + campaignName) * 450);
      const sendDate = recentSendDate(accId + '-sms-' + campaignName + '-date');

      items.push({
        id: nextId(),
        accountId: accId,
        category: 'TXT Message Parts',
        description: campaignName,
        sendDate,
        items: parts,
        createdDate: recentDate(accId + '-sms-' + campaignName + '-created'),
        user: seededUser(accId + '-sms-' + campaignName),
      });
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// 7. Survey Responses — for accounts with surveys
// ---------------------------------------------------------------------------

function generateSurveyResponses(): BillingLineItem[] {
  const items: BillingLineItem[] = [];

  const surveyAccounts = [
    { accId: 'acc-master', surveys: ['Post-Treatment Satisfaction', 'NPS Survey Q1'] },
    { accId: 'acc-auckland', surveys: ['Auckland Service Feedback'] },
    { accId: 'acc-ccc-events', surveys: ['Event Satisfaction Survey'] },
    { accId: 'acc-ccc-libraries', surveys: ['Library Services Feedback'] },
    { accId: 'acc-stc', surveys: ['Donor Experience Survey'] },
  ];

  for (const { accId, surveys } of surveyAccounts) {
    for (const surveyName of surveys) {
      const responses = Math.floor(15 + seededRandom(accId + '-survey-' + surveyName) * 200);

      items.push({
        id: nextId(),
        accountId: accId,
        category: 'Survey Responses',
        description: surveyName,
        sendDate: null,
        items: responses,
        createdDate: recentDate(accId + '-survey-' + surveyName + '-created'),
        user: seededUser(accId + '-survey-' + surveyName),
      });
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// 8. Event Triggered Emails — automated emails triggered by events
// ---------------------------------------------------------------------------

function generateEventTriggeredEmails(): BillingLineItem[] {
  const items: BillingLineItem[] = [];

  const eventAccounts = [
    { accId: 'acc-master', events: ['Birthday Email', 'Anniversary Reward'] },
    { accId: 'acc-auckland', events: ['Abandoned Cart Reminder'] },
    { accId: 'acc-wellington', events: ['Membership Renewal Notice'] },
    { accId: 'acc-ccc', events: ['Rates Overdue Notice', 'Service Request Update'] },
    { accId: 'acc-stc', events: ['Recurring Donation Receipt'] },
    { accId: 'acc-stc-fundraising', events: ['Donation Milestone Email'] },
  ];

  for (const { accId, events } of eventAccounts) {
    for (const eventName of events) {
      const count = Math.floor(20 + seededRandom(accId + '-evt-' + eventName) * 300);
      const sendDate = recentSendDate(accId + '-evt-' + eventName + '-date');

      items.push({
        id: nextId(),
        accountId: accId,
        category: 'Event Triggered Emails',
        description: eventName,
        sendDate,
        items: count,
        createdDate: recentDate(accId + '-evt-' + eventName + '-created'),
        user: seededUser(accId + '-evt-' + eventName),
      });
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// 9. Integrations — one row per connection, billed to the OWNING account only
//    Each automation within a connection generates sync records
// ---------------------------------------------------------------------------

function generateIntegrations(): BillingLineItem[] {
  const items: BillingLineItem[] = [];
  const cycle = getCurrentBillingCycle();

  for (const conn of connections) {
    const connAutomations = connectors.filter((a) => a.connectionId === conn.id);

    if (connAutomations.length === 0) {
      // Connection with no automations — still bill as one integration
      items.push({
        id: nextId(),
        accountId: conn.accountId,
        category: 'Integration',
        description: conn.name,
        sendDate: null,
        items: 1,
        createdDate: recentDate(conn.id + '-int-created'),
        user: seededUser(conn.id + '-int'),
        billingCycleStart: cycle.start,
        billingCycleEnd: cycle.end,
      });
    } else {
      // One row per automation
      for (const auto of connAutomations) {
        items.push({
          id: nextId(),
          accountId: conn.accountId,
          category: 'Integration',
          description: auto.name,
          sendDate: null,
          items: 1,
          createdDate: recentDate(auto.id + '-int-created'),
          user: seededUser(auto.id + '-int'),
          billingCycleStart: cycle.start,
          billingCycleEnd: cycle.end,
        });
      }
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// Assemble all billing line items
// ---------------------------------------------------------------------------

function generateBillingData(): BillingLineItem[] {
  idCounter = 0;

  return [
    ...generateDatabaseRecords(),
    ...generateTransactionalRecords(),
    ...generateMailouts(),
    ...generateAutomatedMailouts(),
    ...generateFormTriggeredEmails(),
    ...generateTxtMessageParts(),
    ...generateSurveyResponses(),
    ...generateEventTriggeredEmails(),
    ...generateIntegrations(),
  ];
}

export const billingLineItems: BillingLineItem[] = generateBillingData();
