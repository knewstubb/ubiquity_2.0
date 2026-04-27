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
CREATE POLICY "Authenticated access" ON user_changelog_seen FOR ALL USING (auth.role() = 'authenticated');;
