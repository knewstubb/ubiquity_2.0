-- 001_initial_schema.sql
-- Collaborative Prototype Infrastructure — initial database schema
-- Creates all domain tables, collaboration tables, indexes, RLS policies,
-- and the reset_user_data RPC function.

-- =============================================================================
-- DOMAIN TABLES
-- =============================================================================

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES accounts(id),
  child_ids TEXT[] DEFAULT '{}',
  region TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  goal TEXT NOT NULL DEFAULT '',
  date_range JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  journey_ids TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  modified_by TEXT
);

CREATE TABLE journeys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  account_id TEXT NOT NULL REFERENCES accounts(id),
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  node_count INTEGER NOT NULL DEFAULT 0,
  entry_count INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('welcome', 're-engagement', 'transactional', 'promotional')),
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  settings JSONB NOT NULL DEFAULT '{}',
  modified_by TEXT
);

CREATE TABLE connections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  protocol TEXT NOT NULL CHECK (protocol IN ('S3', 'SFTP', 'Azure Blob')),
  status TEXT NOT NULL CHECK (status IN ('connected', 'error')),
  base_path TEXT NOT NULL DEFAULT '',
  config JSONB NOT NULL DEFAULT '{}',
  modified_by TEXT
);

CREATE TABLE connectors (
  id TEXT PRIMARY KEY,
  connection_id TEXT NOT NULL REFERENCES connections(id),
  name TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'export',
  data_type TEXT NOT NULL,
  transactional_source TEXT,
  enrichment_key_field TEXT,
  selected_fields JSONB NOT NULL DEFAULT '[]',
  file_type TEXT NOT NULL CHECK (file_type IN ('csv', 'json', 'xml')),
  format_options JSONB NOT NULL DEFAULT '{}',
  file_naming_pattern TEXT NOT NULL DEFAULT '',
  schedule TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified_by TEXT
);

CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  membership_tier TEXT NOT NULL CHECK (membership_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  join_date TEXT NOT NULL,
  communication_preferences JSONB NOT NULL DEFAULT '{}',
  account_id TEXT NOT NULL REFERENCES accounts(id),
  segment_ids TEXT[] DEFAULT '{}',
  journey_ids TEXT[] DEFAULT '{}',
  activity_timeline JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE segments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  type TEXT NOT NULL CHECK (type IN ('smart', 'manual')),
  root_group JSONB NOT NULL DEFAULT '{}',
  member_count INTEGER NOT NULL DEFAULT 0,
  modified_by TEXT
);

CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'colour', 'font', 'footer')),
  scope TEXT NOT NULL CHECK (scope IN ('global', 'campaign', 'account')),
  account_id TEXT NOT NULL REFERENCES accounts(id),
  campaign_id TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  colour_value TEXT,
  modified_by TEXT
);

CREATE TABLE treatments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES contacts(id),
  treatment_type TEXT NOT NULL,
  therapist_name TEXT NOT NULL,
  treatment_date TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price NUMERIC NOT NULL
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES contacts(id),
  product_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Skincare', 'Wellness', 'Gift Card', 'Treatment Voucher')),
  purchase_channel TEXT NOT NULL CHECK (purchase_channel IN ('In-Person', 'Online')),
  purchase_date TEXT NOT NULL,
  price NUMERIC NOT NULL
);

CREATE TABLE permission_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  permissions JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE user_account_assignments (
  user_id TEXT NOT NULL,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  permission_group_id TEXT REFERENCES permission_groups(id),
  custom_permissions JSONB,
  PRIMARY KEY (user_id, account_id)
);

CREATE TABLE prototype_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  initials TEXT NOT NULL DEFAULT ''
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false,
  link_to TEXT
);

CREATE TABLE field_registry (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE operator_registry (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE journey_seeds (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE spa_contacts (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE transactional_data (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- =============================================================================
-- COLLABORATION TABLES
-- =============================================================================

CREATE TABLE feature_flags (
  name TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  description TEXT NOT NULL DEFAULT '',
  scope TEXT NOT NULL CHECK (scope IN ('page', 'component')) DEFAULT 'page',
  target TEXT NOT NULL DEFAULT ''
);

CREATE TABLE feedback_comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_route TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_display_name TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE activity_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL,
  page_route TEXT NOT NULL,
  interaction_type TEXT,
  target_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE changelog_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  affected_routes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_changelog_seen (
  user_id TEXT NOT NULL,
  last_seen_entry_id TEXT NOT NULL REFERENCES changelog_entries(id),
  PRIMARY KEY (user_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_activity_log_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_route ON activity_log(page_route, created_at DESC);
CREATE INDEX idx_feedback_route ON feedback_comments(page_route);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON accounts FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON campaigns FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON journeys FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON connections FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON connectors FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON contacts FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON segments FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON assets FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON treatments FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON products FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE permission_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON permission_groups FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE user_account_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON user_account_assignments FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE prototype_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON prototype_users FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON notifications FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE field_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON field_registry FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE operator_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON operator_registry FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE journey_seeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON journey_seeds FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE spa_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON spa_contacts FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE transactional_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON transactional_data FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON feature_flags FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE feedback_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON feedback_comments FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON activity_log FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON changelog_entries FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE user_changelog_seen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated access" ON user_changelog_seen FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- RPC FUNCTION: reset_user_data
-- =============================================================================

CREATE OR REPLACE FUNCTION reset_user_data(target_user_id TEXT)
RETURNS void AS $$
BEGIN
  -- Delete rows modified by this user from mutable tables
  DELETE FROM connectors WHERE modified_by = target_user_id;
  DELETE FROM connections WHERE modified_by = target_user_id;
  DELETE FROM campaigns WHERE modified_by = target_user_id;
  DELETE FROM journeys WHERE modified_by = target_user_id;
  DELETE FROM segments WHERE modified_by = target_user_id;
  DELETE FROM assets WHERE modified_by = target_user_id;
  -- Re-insert seed baseline is handled by the client calling the seed adapter
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
