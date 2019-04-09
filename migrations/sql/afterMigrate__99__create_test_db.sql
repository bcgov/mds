DO
$do$
DECLARE
BEGIN
  CREATE EXTENSION IF NOT EXISTS dblink;
  IF (EXISTS (SELECT 1 FROM pg_database WHERE datname = 'mds_test')) THEN
    RAISE NOTICE 'Database already exists';
    IF (EXISTS (SELECT * FROM current_catalog WHERE current_database='mds')) THEN
        RAISE NOTICE 'Recreating mds_test database';
        PERFORM dblink_connect('');
        PERFORM dblink_exec('DROP DATABASE mds_test');
        PERFORM dblink_exec('CREATE DATABASE mds_test OWNER mds');
    END IF;
  ELSE
    PERFORM dblink_connect('');
    PERFORM dblink_exec('CREATE DATABASE mds_test OWNER mds');
  END IF;
END
$do$;