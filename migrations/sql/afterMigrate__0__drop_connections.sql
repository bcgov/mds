SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE datname = IN ('mds', 'mds_test')
  AND pid <> pg_backend_pid();