DROP DATABASE IF EXISTS mds_test;

-- Kill any outstanding DB connections
SELECT
    pg_terminate_backend(pid)
FROM
    pg_stat_activity
WHERE
    -- don't kill my own connection!
    pid <> pg_backend_pid()
    -- don't kill the connections to other databases
    AND datname = 'mds'
;

CREATE DATABASE mds_test WITH TEMPLATE mds;