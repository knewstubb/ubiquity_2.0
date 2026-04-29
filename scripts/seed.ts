/**
 * scripts/seed.ts
 *
 * Populates a Supabase database with the prototype's demo data.
 * Uses the service role key for admin access (bypasses RLS, creates auth users).
 *
 * Usage: npm run seed
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
 * (reads from .env file via manual parsing — no dotenv dependency).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// 1. Load env vars (parse .env manually to avoid extra dependency)
// ---------------------------------------------------------------------------

function loadEnv(): Record<string, string> {
  const envPath = resolve(process.cwd(), '.env');
  try {
    const content = readFileSync(envPath, 'utf-8');
    const vars: Record<string, string> = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      vars[key] = val;
    }
    return vars;
  } catch {
    return {};
  }
}

const env = loadEnv();
const SUPABASE_URL = process.env.SUPABASE_URL || env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  console.error('   Set them in .env or as environment variables.');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});


// ---------------------------------------------------------------------------
// 2. Import seed data
// ---------------------------------------------------------------------------

import { accounts } from '../src/data/accounts.js';
import { campaigns, journeys } from '../src/data/campaigns.js';
import { connections } from '../src/data/connections.js';
import { connectors } from '../src/data/connectors.js';
import { contacts } from '../src/data/contacts.js';
import { segments } from '../src/data/segments.js';
import { seedAssets } from '../src/data/assets.js';
import { defaultPermissionGroups, defaultAssignments } from '../src/data/permissions.js';
import { users } from '../src/data/users.js';
import { treatments } from '../src/data/treatments.js';
import { products } from '../src/data/products.js';
import { notifications } from '../src/data/notifications.js';
import { journeyDefinitions } from '../src/data/journeySeeds.js';
import { CONTACT_FIELDS, TREATMENT_FIELDS, PRODUCT_FIELDS } from '../src/data/fieldRegistry.js';
import { getOperatorsForFieldType, operatorLabels } from '../src/data/operatorRegistry.js';
import { spaContacts } from '../src/data/spaContacts.js';
import { transactionalDatabases } from '../src/data/transactionalData.js';

// ---------------------------------------------------------------------------
// 3. Helper: upsert wrapper with error handling
// ---------------------------------------------------------------------------

async function upsertRows(
  table: string,
  rows: Record<string, unknown>[],
  conflictColumns?: string,
): Promise<void> {
  if (rows.length === 0) return;

  const opts: { onConflict?: string } = {};
  if (conflictColumns) opts.onConflict = conflictColumns;

  const { error } = await supabase.from(table).upsert(rows, opts);
  if (error) {
    console.error(`  ❌ ${table}: ${error.message}`);
    throw error;
  }
  console.log(`  ✅ ${table}: ${rows.length} rows`);
}


// ---------------------------------------------------------------------------
// 4. Reviewer auth accounts
// ---------------------------------------------------------------------------

const REVIEWER_ACCOUNTS = [
  { email: 'reviewer1@ubiquity.test', password: 'password123', displayName: 'Reviewer One' },
  { email: 'reviewer2@ubiquity.test', password: 'password123', displayName: 'Reviewer Two' },
];

async function seedReviewerAccounts(): Promise<void> {
  console.log('\n🔑 Creating reviewer auth accounts...');
  for (const reviewer of REVIEWER_ACCOUNTS) {
    // Try to create — if user already exists, Supabase returns an error we can ignore
    const { data, error } = await supabase.auth.admin.createUser({
      email: reviewer.email,
      password: reviewer.password,
      email_confirm: true,
      user_metadata: { display_name: reviewer.displayName },
    });

    if (error) {
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        console.log(`  ⏭️  ${reviewer.email} already exists — skipping`);
      } else {
        console.error(`  ❌ ${reviewer.email}: ${error.message}`);
      }
    } else {
      console.log(`  ✅ ${reviewer.email} created (id: ${data.user.id})`);
    }
  }
}


// ---------------------------------------------------------------------------
// 5. Seed functions for each table (camelCase → snake_case mapping)
// ---------------------------------------------------------------------------

async function seedAccounts(): Promise<void> {
  const rows = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    parent_id: a.parentId,
    child_ids: a.childIds,
    region: a.region,
    status: a.status,
  }));
  await upsertRows('accounts', rows);
}

async function seedCampaigns(): Promise<void> {
  const rows = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    account_id: c.accountId,
    goal: c.goal,
    date_range: c.dateRange,
    status: c.status,
    journey_ids: c.journeyIds,
    tags: c.tags,
  }));
  await upsertRows('campaigns', rows);
}

async function seedJourneys(): Promise<void> {
  const rows = journeys.map((j) => ({
    id: j.id,
    name: j.name,
    campaign_id: j.campaignId,
    account_id: j.accountId,
    status: j.status,
    node_count: j.nodeCount,
    entry_count: j.entryCount,
    type: j.type,
    // Basic journeys from campaigns.ts don't have nodes/edges/settings
    nodes: [],
    edges: [],
    settings: {},
  }));

  // Merge journey definitions (from journeySeeds.ts) which have nodes/edges/settings
  // These share IDs with some journeys above, so they'll overwrite via upsert
  const defRows = journeyDefinitions.map((jd) => ({
    id: jd.id,
    name: jd.name,
    campaign_id: jd.campaignId,
    account_id: jd.accountId,
    status: jd.status,
    node_count: jd.nodeCount,
    entry_count: jd.entryCount,
    type: jd.type,
    nodes: jd.nodes,
    edges: jd.edges,
    settings: jd.settings,
  }));

  // Combine: basic journeys first, then definitions overwrite matching IDs
  const defIds = new Set(defRows.map((r) => r.id));
  const combined = [
    ...rows.filter((r) => !defIds.has(r.id as string)),
    ...defRows,
  ];

  await upsertRows('journeys', combined);
}

async function seedConnections(): Promise<void> {
  const rows = connections.map((c) => ({
    id: c.id,
    name: c.name,
    protocol: c.protocol,
    status: c.status,
    base_path: c.basePath,
    account_id: c.accountId,
    config: c.config,
  }));
  await upsertRows('connections', rows);
}

// Note: connectors table is skipped — connectors are user-created at runtime

async function seedConnectors(): Promise<void> {
  const rows = connectors.map((c) => ({
    id: c.id,
    connection_id: c.connectionId,
    name: c.name,
    direction: c.direction,
    data_type: c.dataType,
    transactional_source: c.transactionalSource ?? null,
    enrichment_key_field: c.enrichmentKeyField ?? null,
    selected_fields: c.selectedFields,
    file_type: c.fileType,
    format_options: c.formatOptions,
    file_naming_pattern: c.fileNamingPattern,
    schedule: c.schedule,
    filters: c.filters,
    status: c.status,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  }));
  await upsertRows('connectors', rows);
}

async function seedContacts(): Promise<void> {
  // contacts.ts has the simple ContactRecord shape (no accountId/segmentIds/etc.)
  // We need to map them to the DB schema which expects those fields
  const rows = contacts.map((c) => ({
    id: c.id,
    first_name: c.firstName,
    last_name: c.lastName,
    email: c.email,
    phone: c.phone,
    membership_tier: c.membershipTier,
    join_date: c.joinDate,
    communication_preferences: c.communicationPreferences,
    // contacts.ts ContactRecord doesn't have accountId — default to acc-master
    account_id: 'acc-master',
    segment_ids: [],
    journey_ids: [],
    activity_timeline: [],
  }));
  await upsertRows('contacts', rows);
}

async function seedSegments(): Promise<void> {
  const rows = segments.map((s) => ({
    id: s.id,
    name: s.name,
    account_id: s.accountId,
    type: s.type,
    root_group: s.rootGroup,
    member_count: s.memberCount,
  }));
  await upsertRows('segments', rows);
}

async function seedAssetRows(): Promise<void> {
  const rows = seedAssets.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    scope: a.scope,
    account_id: a.accountId,
    campaign_id: a.campaignId,
    tags: a.tags,
    created_at: a.createdAt,
    colour_value: a.colourValue ?? null,
  }));
  await upsertRows('assets', rows);
}


async function seedTreatments(): Promise<void> {
  const rows = treatments.map((t) => ({
    id: t.id,
    customer_id: t.customerId,
    treatment_type: t.treatmentType,
    therapist_name: t.therapistName,
    treatment_date: t.treatmentDate,
    duration_minutes: t.durationMinutes,
    price: t.price,
  }));
  await upsertRows('treatments', rows);
}

async function seedProducts(): Promise<void> {
  const rows = products.map((p) => ({
    id: p.id,
    customer_id: p.customerId,
    product_name: p.productName,
    category: p.category,
    purchase_channel: p.purchaseChannel,
    purchase_date: p.purchaseDate,
    price: p.price,
  }));
  await upsertRows('products', rows);
}

async function seedPermissionGroups(): Promise<void> {
  const rows = defaultPermissionGroups.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    permissions: g.permissions,
  }));
  await upsertRows('permission_groups', rows);
}

async function seedUserAccountAssignments(): Promise<void> {
  const rows = defaultAssignments.map((a) => ({
    user_id: a.userId,
    account_id: a.accountId,
    permission_group_id: a.permissionGroupId,
    custom_permissions: a.customPermissions,
  }));
  await upsertRows('user_account_assignments', rows, 'user_id,account_id');
}

async function seedPrototypeUsers(): Promise<void> {
  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    initials: u.initials,
  }));
  await upsertRows('prototype_users', rows);
}

async function seedNotifications(): Promise<void> {
  const rows = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    message: n.message,
    timestamp: n.timestamp,
    read: n.read,
    link_to: n.linkTo ?? null,
  }));
  await upsertRows('notifications', rows);
}


// ---------------------------------------------------------------------------
// 6. Generic {id, data: JSONB} tables
// ---------------------------------------------------------------------------

async function seedFieldRegistry(): Promise<void> {
  const allFields = [...CONTACT_FIELDS, ...TREATMENT_FIELDS, ...PRODUCT_FIELDS];
  // Deduplicate by key — Postgres ON CONFLICT can't handle duplicate keys in a single batch
  const seen = new Set<string>();
  const rows: { id: string; data: unknown }[] = [];
  for (const f of allFields) {
    if (!seen.has(f.key)) {
      seen.add(f.key);
      rows.push({ id: f.key, data: f });
    }
  }
  await upsertRows('field_registry', rows);
}

async function seedOperatorRegistry(): Promise<void> {
  const dataTypes = ['string', 'number', 'date', 'enum'];
  const rows = dataTypes.map((dt) => ({
    id: dt,
    data: {
      dataType: dt,
      operators: getOperatorsForFieldType(dt),
      labels: operatorLabels,
    },
  }));
  await upsertRows('operator_registry', rows);
}

async function seedJourneySeeds(): Promise<void> {
  // Journey definitions are already seeded into the journeys table with full
  // nodes/edges/settings. Also store them in journey_seeds as reference data.
  const rows = journeyDefinitions.map((jd) => ({
    id: jd.id,
    data: jd,
  }));
  await upsertRows('journey_seeds', rows);
}

async function seedSpaContacts(): Promise<void> {
  const rows = spaContacts.map((c) => ({
    id: c.id,
    data: c,
  }));
  await upsertRows('spa_contacts', rows);
}

async function seedTransactionalData(): Promise<void> {
  const rows = transactionalDatabases.map((db) => ({
    id: db.id,
    data: db,
  }));
  await upsertRows('transactional_data', rows);
}


// ---------------------------------------------------------------------------
// 7. Main — seed in dependency order
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('🌱 Seeding Supabase database...\n');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log('');

  // --- Auth accounts ---
  await seedReviewerAccounts();

  // --- Domain tables (dependency order) ---
  console.log('\n📦 Seeding domain tables...');

  // Level 0: no FK dependencies
  await seedAccounts();
  await seedPermissionGroups();
  await seedPrototypeUsers();

  // Level 1: depends on accounts
  await seedCampaigns();
  await seedConnections();
  await seedConnectors();
  await seedSegments();

  // Level 2: depends on campaigns + accounts
  await seedJourneys();

  // Level 3: depends on accounts (contacts need account_id)
  await seedContacts();

  // Level 4: depends on contacts
  await seedTreatments();
  await seedProducts();

  // Level 5: depends on accounts + permission_groups
  await seedUserAccountAssignments();

  // Standalone tables
  await seedAssetRows();
  await seedNotifications();

  // --- Generic JSONB tables ---
  console.log('\n📦 Seeding registry / reference tables...');
  await seedFieldRegistry();
  await seedOperatorRegistry();
  await seedJourneySeeds();
  await seedSpaContacts();
  await seedTransactionalData();

  console.log('\n✅ Seed complete!');
}

main().catch((err) => {
  console.error('\n💥 Seed failed:', err);
  process.exit(1);
});
