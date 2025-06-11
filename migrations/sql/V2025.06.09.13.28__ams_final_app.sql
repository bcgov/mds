-- 1. -- a table for the final application itself
CREATE TABLE IF NOT EXISTS ams_final_application (
    ams_final_application_guid    uuid DEFAULT gen_random_uuid()          PRIMARY KEY,
    project_summary_authorization_guid          uuid                                    NOT NULL,
    submitter_name                              VARCHAR(255)                            NOT NULL,
    is_agent                                    boolean DEFAULT false                   NOT NULL,
    is_draft                                    boolean DEFAULT true                    NOT NULL,
    pre_submitted_files                         text[] DEFAULT ARRAY[]::text[]          NOT NULL,
    deleted_ind                                 boolean DEFAULT false                   NOT NULL,
    submitted_timestamp                         timestamp with time zone,
    create_user                                 character varying(60)                   NOT NULL,
    create_timestamp                            timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                                 character varying(60)                   NOT NULL,
    update_timestamp                            timestamp with time zone DEFAULT now()  NOT NULL,

    CONSTRAINT project_summary_authorization_guid_fkey FOREIGN KEY (project_summary_authorization_guid)
        REFERENCES project_summary_authorization(project_summary_authorization_guid) DEFERRABLE INITIALLY DEFERRED              
);

-- 2. -- a table for the document categories for the final application
CREATE TABLE IF NOT EXISTS ams_final_application_document_type (
    ams_final_application_document_type_code   VARCHAR(3)                         PRIMARY KEY,
    description                                         VARCHAR(100)                            NOT NULL,
    active_ind                                          BOOLEAN DEFAULT true                    NOT NULL,
    create_user                                         character varying(60)                   NOT NULL,
    create_timestamp                                    timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                                         character varying(60)                   NOT NULL,
    update_timestamp                                    timestamp with time zone DEFAULT now()  NOT NULL              
);

-- populate document categories
INSERT INTO ams_final_application_document_type (
  ams_final_application_document_type_code,
  description,
  active_ind,
  create_user,
  update_user
) VALUES
  ('AID', 'Application Instruction Document', true, 'system-mds', 'system-mds'),
  ('IRT', 'Information Requirements Table', true, 'system-mds', 'system-mds'),
  ('LOC', 'Location Map', true, 'system-mds', 'system-mds'),
  ('SIT', 'Site Plan', true, 'system-mds', 'system-mds'),
  ('DFF', 'Discharge Factor Form', true, 'system-mds', 'system-mds'),
  ('CLF', 'Clause Form', true, 'system-mds', 'system-mds'),
  ('QPD', 'Qualified Professional Declaration Form', true, 'system-mds', 'system-mds'),
  ('TAR', 'Technical Assessment Report', true, 'system-mds', 'system-mds'),
  ('SPR', 'Supporting Documents', true, 'system-mds', 'system-mds'),
  ('NEN', 'Notification and Engagement', true, 'system-mds', 'system-mds');

-- 3. -- a joining table for final application documents
CREATE TABLE IF NOT EXISTS ams_final_application_document_xref (
    ams_final_application_document_xref_guid uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ams_final_application_guid uuid NOT NULL,
    ams_final_application_document_type_code VARCHAR(3) NOT NULL,
    mine_document_guid uuid NOT NULL,
    deleted_ind BOOLEAN DEFAULT false NOT NULL,
    
    CONSTRAINT ams_final_application_guid_fkey FOREIGN KEY (ams_final_application_guid)
        REFERENCES ams_final_application(ams_final_application_guid) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT ams_final_application_document_type_code_fkey FOREIGN KEY (ams_final_application_document_type_code)
        REFERENCES ams_final_application_document_type(ams_final_application_document_type_code) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT mine_document_guid_fkey FOREIGN KEY (mine_document_guid)
        REFERENCES mine_document(mine_document_guid) DEFERRABLE INITIALLY DEFERRED
);