DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_catalog.pg_roles
        WHERE  rolname = 'pgsync') THEN
        
        ALTER DEFAULT PRIVILEGES FOR ROLE pgsync IN SCHEMA public GRANT SELECT ON TABLES TO mds;
    END IF;
END
$$;