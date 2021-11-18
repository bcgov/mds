CREATE TABLE IF NOT EXISTS project_summary_status_code (
    project_summary_status_code         character varying(3)                 PRIMARY KEY,
    description                         character varying(100)                  NOT NULL,
    display_order                       smallint                                NOT NULL,
    active_ind                          boolean DEFAULT true                    NOT NULL,
    create_user                         character varying(60)                   NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                         character varying(60)                   NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()  NOT NULL
);

COMMENT ON TABLE project_summary_status_code is 'All the possible and available status codes for project summaries.';
ALTER TABLE project_summary_status_code OWNER TO mds;

INSERT INTO project_summary_status_code(project_summary_status_code, description, display_order, create_user, update_user)
VALUES ('O', 'Open', 10, 'system-mds', 'system-mds'), ('C', 'Closed', 20, 'system-mds', 'system-mds'), ('W', 'Withdrawn', 30, 'system-mds', 'system-mds');

CREATE TABLE IF NOT EXISTS project_summary (
    project_summary_guid            uuid DEFAULT gen_random_uuid()        PRIMARY KEY,
    project_summary_id              serial                                   NOT NULL,
    project_summary_description     character varying(300)                           ,
    project_summary_date            timestamp with time zone                 NOT NULL,
    deleted_ind                     boolean DEFAULT false                    NOT NULL,
    status_code                     character varying(3)                     NOT NULL,

    mine_guid                       uuid                                     NOT NULL,
    project_summary_lead_party_guid uuid                                             ,
    
    create_user                     character varying(60)                    NOT NULL,
    create_timestamp                timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                     character varying(60)                    NOT NULL,
    update_timestamp                timestamp with time zone DEFAULT now()   NOT NULL,

    CONSTRAINT project_summary_id UNIQUE (project_summary_id),
    CONSTRAINT project_summary_lead_party_guid_fkey FOREIGN KEY (project_summary_lead_party_guid) REFERENCES party(party_guid) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT status_code_fkey FOREIGN KEY (status_code) REFERENCES project_summary_status_code(project_summary_status_code) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE project_summary OWNER TO mds;

CREATE TABLE IF NOT EXISTS project_summary_document_type (
    project_summary_document_type_code         character varying(3)                 PRIMARY KEY,
    description                                character varying(100)                  NOT NULL,
    display_order                              smallint                                NOT NULL,
    active_ind                                 boolean DEFAULT true                    NOT NULL,
    create_user                                character varying(60)                   NOT NULL,
    create_timestamp                           timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                                character varying(60)                   NOT NULL,
    update_timestamp                           timestamp with time zone DEFAULT now()  NOT NULL
);

COMMENT ON TABLE project_summary_document_type is 'All the possible and available document types for project summaries.';
ALTER TABLE project_summary_document_type OWNER TO mds;

INSERT INTO project_summary_document_type(project_summary_document_type_code, description, display_order, create_user, update_user)
VALUES ('GEN', 'General', 10, 'system-mds', 'system-mds');

CREATE TABLE IF NOT EXISTS project_summary_document_xref (
    project_summary_document_xref_guid         uuid DEFAULT gen_random_uuid()       PRIMARY KEY,
    mine_document_guid                         uuid                                    NOT NULL,
    project_summary_id                         smallint                                NOT NULL,
    project_summary_document_type_code         character varying(3)                    NOT NULL,

    CONSTRAINT project_summary_document_xref_guid UNIQUE (project_summary_document_xref_guid),
    CONSTRAINT mine_document_guid_fkey FOREIGN KEY (mine_document_guid) REFERENCES mine_document(mine_document_guid) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT project_summary_id_fkey FOREIGN KEY (project_summary_id) REFERENCES project_summary(project_summary_id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT project_summary_document_type_code_fkey FOREIGN KEY (project_summary_document_type_code) REFERENCES project_summary_document_type(project_summary_document_type_code) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE project_summary_document_xref is 'Links mine documents to project summaries.';
ALTER TABLE project_summary_document_xref OWNER TO mds;