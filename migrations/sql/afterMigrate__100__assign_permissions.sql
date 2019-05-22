-- Grant permissions to the non-superuser
GRANT ALL PRIVILEGES ON DATABASE mds TO mds;
GRANT ALL PRIVILEGES ON SCHEMA public TO mds;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mds;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mds;
GRANT postgres TO mds;

CREATE SCHEMA IF NOT EXISTS nris; --alembic can do this, but user alembic using using probably shouldn't have permission to. 
DO
$do$
BEGIN 
    IF NOT EXISTS(select from pg_catalog.pg_roles where rolname= 'nris') THEN 
        CREATE USER nris with PASSWORD 'VsPJAuMJHu3IVMEv';
        GRANT ALL PRIVILEGES ON SCHEMA nris to nris;
    END IF; 
END
$do$; 
