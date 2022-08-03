CREATE TABLE IF NOT EXISTS major_mine_application_status_code (
  major_mine_application_status_code character varying(3)                 PRIMARY KEY,
  "description"                   character varying(100)                  NOT NULL,
  active_ind                      boolean DEFAULT true                    NOT NULL,
  create_user                     character varying(60)                   NOT NULL,
  create_timestamp                timestamp with time zone DEFAULT now()  NOT NULL,
  update_user                     character varying(60)                   NOT NULL,
  update_timestamp                timestamp with time zone DEFAULT now()  NOT NULL
);
ALTER TABLE major_mine_application_status_code OWNER TO mds;
--
-- Name: TABLE major_mine_application_status_code; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE major_mine_application_status_code IS 'Major mine application status. ';


insert into major_mine_application_status_code(major_mine_application_status_code, description, create_user, update_user)
   values
   ('REC','Pending Review', 'system-mds','system-mds'),
   ('UNR','In review - with reviewers', 'system-mds','system-mds'),
   ('APV','Approved', 'system-mds','system-mds');


CREATE TABLE IF NOT EXISTS major_mine_application (
  major_mine_application_guid      uuid DEFAULT gen_random_uuid()       PRIMARY KEY,
  major_mine_application_id        serial                                  NOT NULL,
  project_guid                     uuid                                    NOT NULL,
  submission_project_title         character varying(300)                  NOT NULL,
  status_code                      character varying(3)                    NOT NULL,
  deleted_ind                      boolean DEFAULT false                   NOT NULL,
  create_user                      character varying(60)                   NOT NULL,
  create_timestamp                 timestamp with time zone DEFAULT now()  NOT NULL,
  update_user                      character varying(60)                   NOT NULL,
  update_timestamp                 timestamp with time zone DEFAULT now()  NOT NULL,
  
  CONSTRAINT major_mine_application_id UNIQUE (major_mine_application_id),
  CONSTRAINT project_guid_fkey FOREIGN KEY (project_guid) REFERENCES project(project_guid),
  CONSTRAINT status_code_fkey FOREIGN KEY (status_code) REFERENCES major_mine_application_status_code(major_mine_application_status_code)
);
ALTER TABLE major_mine_application OWNER TO mds;
--
-- Name: TABLE major_mine_application; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE major_mine_application IS 'Major Mine Application associated to a project. ';

CREATE TABLE IF NOT EXISTS major_mine_application_document_type (
    major_mine_application_document_type_code                 character varying(3)                 PRIMARY KEY,
    description                                               character varying(100)                  NOT NULL,
    display_order                                             smallint                                NOT NULL,
    active_ind                                                boolean DEFAULT true                    NOT NULL,
    create_user                                               character varying(60)                   NOT NULL,
    create_timestamp                                          timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                                               character varying(60)                   NOT NULL,
    update_timestamp                                          timestamp with time zone DEFAULT now()  NOT NULL
);

COMMENT ON TABLE major_mine_application_document_type is 'All the possible and available document types for a major mine application.';
ALTER TABLE major_mine_application_document_type OWNER TO mds;

INSERT INTO major_mine_application_document_type(major_mine_application_document_type_code, description, display_order, create_user, update_user)
VALUES ('PRM', 'Primary', 10, 'system-mds', 'system-mds'),
       ('SPT', 'Spatial', 20,'system-mds', 'system-mds'),
       ('SPR', 'Supporting', 30, 'system-mds','system-mds');

CREATE TABLE IF NOT EXISTS major_mine_application_document_xref (
    major_mine_application_document_xref_guid   uuid DEFAULT gen_random_uuid()       PRIMARY KEY,
    mine_document_guid                                        uuid                                    NOT NULL,
    major_mine_application_id                                 smallint                                NOT NULL,
    major_mine_application_document_type_code                 character varying(3)                    NOT NULL,

    CONSTRAINT major_mine_application_document_xref_guid UNIQUE (major_mine_application_document_xref_guid),
    CONSTRAINT mine_document_guid_fkey FOREIGN KEY (mine_document_guid) REFERENCES mine_document(mine_document_guid) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT major_mine_application_id_fkey FOREIGN KEY (major_mine_application_id) REFERENCES major_mine_application(major_mine_application_id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT major_mine_application_document_type_code_fkey FOREIGN KEY (major_mine_application_document_type_code) REFERENCES major_mine_application_document_type(major_mine_application_document_type_code) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE major_mine_application_document_xref is 'Links mine documents to major mine application.';
ALTER TABLE major_mine_application_document_xref OWNER TO mds;