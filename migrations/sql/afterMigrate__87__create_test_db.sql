DO
$$
DECLARE
BEGIN
  CREATE EXTENSION IF NOT EXISTS dblink;
  IF (EXISTS (SELECT 1 FROM pg_database WHERE datname = 'mds_test')) THEN
    RAISE NOTICE 'Database already exists';
  ELSE
    PERFORM dblink_connect('');
    PERFORM dblink_exec('CREATE DATABASE mds_test OWNER mds');
  END IF;
END
$$;