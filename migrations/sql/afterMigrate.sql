DROP DATABASE IF EXISTS mds_test;
CREATE DATABASE mds_test WITH TEMPLATE mds;
COMMIT;

-- Grant all table permissions to the regular user
GRANT ALL PRIVILEGES ON DATABASE mds TO mds;