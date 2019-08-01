/**
Allow MDS user to CRUD anything on the mds schema
**/
GRANT ALL PRIVILEGES ON DATABASE mds TO mds;
GRANT ALL PRIVILEGES ON SCHEMA public TO mds;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mds;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mds;

GRANT ALL PRIVILEGES ON SCHEMA NOW_Submissions TO mds;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA NOW_Submissions TO mds;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA NOW_Submissions TO mds;

/**
Allow NRIS user to CRUD anything on the nris schema
**/
GRANT ALL PRIVILEGES ON SCHEMA nris TO nris;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA nris TO nris;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA nris TO nris;

/**
Allow Document Manager user to CRUD anything on the docman schema
**/
GRANT ALL PRIVILEGES ON SCHEMA docman TO docman;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA docman TO docman;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA docman TO docman;

/**
Allow logstash user to READ anything on the mds schema
**/
GRANT USAGE ON SCHEMA public TO logstash;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO logstash;

/**
Allow metabase user to READ anything on the mds schema
**/
GRANT USAGE ON SCHEMA public TO metabase;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO metabase;
GRANT USAGE ON SCHEMA nris TO metabase;
GRANT SELECT ON ALL TABLES IN SCHEMA nris TO metabase;
