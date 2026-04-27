CREATE OR REPLACE FUNCTION reset_user_data(target_user_id TEXT)
RETURNS void AS $$
BEGIN
  DELETE FROM connectors WHERE modified_by = target_user_id;
  DELETE FROM connections WHERE modified_by = target_user_id;
  DELETE FROM campaigns WHERE modified_by = target_user_id;
  DELETE FROM journeys WHERE modified_by = target_user_id;
  DELETE FROM segments WHERE modified_by = target_user_id;
  DELETE FROM assets WHERE modified_by = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION reset_user_data(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION reset_user_data(TEXT) TO authenticated;;
