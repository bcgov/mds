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

GRANT ALL PRIVILEGES ON SCHEMA MMS_NOW_Submissions TO mds;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA MMS_NOW_Submissions TO mds;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA MMS_NOW_Submissions TO mds;

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
GRANT USAGE ON SCHEMA now_submissions TO metabase;
GRANT SELECT ON ALL TABLES IN SCHEMA now_submissions TO metabase;
GRANT USAGE ON SCHEMA mms_now_submissions TO metabase;
GRANT SELECT ON ALL TABLES IN SCHEMA mms_now_submissions TO metabase;
GRANT USAGE ON SCHEMA docman TO metabase;
GRANT SELECT ON ALL TABLES IN SCHEMA docman TO metabase;

/**
Allow mds_data_analytics user to READ anything on the nris schema
**/
DO
$$
BEGIN
    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mds_data_analytics') THEN
        GRANT USAGE ON SCHEMA nris TO mds_data_analytics;
        GRANT SELECT ON ALL TABLES IN SCHEMA nris TO mds_data_analytics;
    END IF;
END
$$;

/**
Allow mds_data_analytics user to READ specific tables on the public schema
**/
DO
$$
BEGIN
    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mds_data_analytics') THEN
        GRANT USAGE ON SCHEMA public TO mds_data_analytics;
        GRANT SELECT ON
            public.minespace_user_document_xref,
            public.notice_of_work_tier,
            public.major_mine_application_document_subtype,
            public.ams_final_application_document_xref,
            public.ams_final_application_version,
            public.minespace_user_version,
            public.minespace_user_request,
            public.minespace_user_role_xref,
            public.now_application_tier,
            public.email_tracking,
            public.permit_condition_tag_xref,
            public.standard_permit_condition_tag_xref,
            public.minespace_user_role,
            public.ams_final_application,
            public.now_application_tier_version,
            public.ams_final_application_document_type,
            public.permit_condition_tag
        TO mds_data_analytics;
    END IF;
END
$$;