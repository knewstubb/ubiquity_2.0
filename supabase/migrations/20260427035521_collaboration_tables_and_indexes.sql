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

CREATE INDEX idx_activity_log_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_route ON activity_log(page_route, created_at DESC);
CREATE INDEX idx_feedback_route ON feedback_comments(page_route);;
