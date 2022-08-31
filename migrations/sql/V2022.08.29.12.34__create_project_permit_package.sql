CREATE TABLE IF NOT EXISTS project_decision_package_status_code (
  project_decision_package_status_code  character varying(3)                 PRIMARY KEY,
  "description"                         character varying(100)                  NOT NULL,
  active_ind                            boolean DEFAULT true                    NOT NULL,
  create_user                           character varying(60)                   NOT NULL,
  create_timestamp                      timestamp with time zone DEFAULT now()  NOT NULL,
  update_user                           character varying(60)                   NOT NULL,
  update_timestamp                      timestamp with time zone DEFAULT now()  NOT NULL
);
ALTER TABLE project_decision_package_status_code OWNER TO mds;
--
-- Name: TABLE project_decision_package_status_code; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE project_decision_package_status_code IS 'Project decision package status. ';


insert into project_decision_package_status_code(project_decision_package_status_code, description, create_user, update_user)
   values
   ('NTS','Not Started', 'system-mds','system-mds'),
   ('INP','In Progress', 'system-mds','system-mds'),
   ('CMP','Completed', 'system-mds','system-mds');


CREATE TABLE IF NOT EXISTS project_decision_package (
  project_decision_package_guid      uuid DEFAULT gen_random_uuid()       PRIMARY KEY,
  project_decision_package_id        serial                                  NOT NULL,
  project_guid                       uuid                                    NOT NULL,
  status_code                        character varying(3)                    NOT NULL,
  deleted_ind                        boolean DEFAULT false                   NOT NULL,
  create_user                        character varying(60)                   NOT NULL,
  create_timestamp                   timestamp with time zone DEFAULT now()  NOT NULL,
  update_user                        character varying(60)                   NOT NULL,
  update_timestamp                   timestamp with time zone DEFAULT now()  NOT NULL,
  
  CONSTRAINT project_decision_package_id UNIQUE (project_decision_package_id),
  CONSTRAINT project_guid_fkey FOREIGN KEY (project_guid) REFERENCES project(project_guid),
  CONSTRAINT status_code_fkey FOREIGN KEY (status_code) REFERENCES project_decision_package_status_code(project_decision_package_status_code)
);
ALTER TABLE project_decision_package OWNER TO mds;
--
-- Name: TABLE project_decision_package; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE project_decision_package IS 'Project decision package associated to a project. ';

CREATE TABLE IF NOT EXISTS project_decision_package_document_type (
    project_decision_package_document_type_code               character varying(3)                 PRIMARY KEY,
    description                                               character varying(100)                  NOT NULL,
    display_order                                             smallint                                NOT NULL,
    active_ind                                                boolean DEFAULT true                    NOT NULL,
    create_user                                               character varying(60)                   NOT NULL,
    create_timestamp                                          timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                                               character varying(60)                   NOT NULL,
    update_timestamp                                          timestamp with time zone DEFAULT now()  NOT NULL
);

COMMENT ON TABLE project_decision_package_document_type is 'All the possible and available document types for a project decision package.';
ALTER TABLE project_decision_package_document_type OWNER TO mds;

INSERT INTO project_decision_package_document_type(project_decision_package_document_type_code, description, display_order, create_user, update_user)
VALUES ('DCP', 'Decision Package', 10, 'system-mds', 'system-mds'),
       ('ADG', 'Additional Government', 20,'system-mds', 'system-mds'),
       ('INM', 'Internal Ministry', 30, 'system-mds','system-mds');

CREATE TABLE IF NOT EXISTS project_decision_package_document_xref (
    project_decision_package_document_xref_guid                 uuid DEFAULT gen_random_uuid()       PRIMARY KEY,
    mine_document_guid                                          uuid                                    NOT NULL,
    project_decision_package_id                                 smallint                                NOT NULL,
    project_decision_package_document_type_code                 character varying(3)                    NOT NULL,

    CONSTRAINT project_decision_package_document_xref_guid UNIQUE (project_decision_package_document_xref_guid),
    CONSTRAINT mine_document_guid_fkey FOREIGN KEY (mine_document_guid) REFERENCES mine_document(mine_document_guid) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT project_decision_package_id_fkey FOREIGN KEY (project_decision_package_id) REFERENCES project_decision_package(project_decision_package_id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT project_decision_package_document_type_code_fkey FOREIGN KEY (project_decision_package_document_type_code) REFERENCES project_decision_package_document_type(project_decision_package_document_type_code) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE project_decision_package_document_xref is 'Links mine documents to project decision package.';
ALTER TABLE project_decision_package_document_xref OWNER TO mds;