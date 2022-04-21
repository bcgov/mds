CREATE TABLE IF NOT EXISTS project (
  project_guid            uuid DEFAULT gen_random_uuid()        PRIMARY KEY,
  project_id              serial                                   NOT NULL,
  mine_guid               uuid                                     NOT NULL,
  project_title           character varying(300)                   NOT NULL,
  project_lead_party_guid uuid                                             ,
  proponent_project_id    character varying(20)                            ,
  create_user             character varying(60)                    NOT NULL,
  create_timestamp        timestamp with time zone DEFAULT now()   NOT NULL,
  update_user             character varying(60)                    NOT NULL,
  update_timestamp        timestamp with time zone DEFAULT now()   NOT NULL,

  CONSTRAINT project_id UNIQUE (project_id),
  CONSTRAINT mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT project_lead_party_guid_fkey FOREIGN KEY (project_lead_party_guid) REFERENCES party(party_guid) ON UPDATE CASCADE ON DELETE SET NULL
);
ALTER TABLE project OWNER TO mds;
--
-- Name: TABLE project; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE project IS 'Project contains Project Summary and Information Requirements Table (IRT). ';


CREATE TABLE IF NOT EXISTS project_contact (
  project_contact_guid                uuid DEFAULT gen_random_uuid()       PRIMARY KEY,
  project_guid                        uuid                                    NOT NULL,
  "name"                              character varying(200)                  NOT NULL,
  job_title                           character varying(100)                          ,
  company_name                        character varying(100)                          ,
  email                               character varying(254)                  NOT NULL,
  phone_number                        character varying(12)                   NOT NULL,
  phone_extension                     character varying(6)                            ,
  is_primary                          boolean DEFAULT true                    NOT NULL,
  deleted_ind                         boolean DEFAULT false                   NOT NULL,
  create_user                         character varying(60)                   NOT NULL,
  create_timestamp                    timestamp with time zone DEFAULT now()  NOT NULL,
  update_user                         character varying(60)                   NOT NULL,
  update_timestamp                    timestamp with time zone DEFAULT now()  NOT NULL,

  CONSTRAINT project_guid_fkey FOREIGN KEY (project_guid) REFERENCES project(project_guid)
);
ALTER TABLE project_contact OWNER TO mds;
--
-- Name: TABLE project_contact; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE project_contact IS 'Project contact details related to a project. ';

-- Add foreign keys to project on children(Summary)
ALTER TABLE project_summary ADD COLUMN IF NOT EXISTS project_guid uuid;
ALTER TABLE project_summary ADD CONSTRAINT project_guid_fkey FOREIGN KEY (project_guid) REFERENCES project(project_guid);