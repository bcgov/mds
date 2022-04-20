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

-- Data Fix:
-- Copy data from project_summary to project table(create a project for every project summary)
INSERT INTO project (mine_guid, project_title, project_lead_party_guid, proponent_project_id, create_user,update_user)
  SELECT ps.mine_guid, ps.project_summary_title, ps.project_summary_lead_party_guid, ps.proponent_project_id, 'system-mds','system-mds'
  FROM project_summary ps
  WHERE mine_guid not in (select mine_guid
								   from project);

-- Update project_summary to include FK to newly created projects
UPDATE project_summary ps SET project_guid = (SELECT project_guid FROM project WHERE mine_guid = ps.mine_guid LIMIT 1);
								  
-- Copy data from project_summary_contact to project_contact by project_guid (copied in the previous query)								   
INSERT INTO project_contact(project_guid, name, job_title, company_name, email, phone_number, phone_extension, is_primary, deleted_ind, create_user, update_user)
  SELECT pr.project_guid, psc.name, psc.job_title, psc.company_name, psc.email, psc.phone_number, psc.phone_extension, psc.is_primary, psc.deleted_ind, psc.create_user, psc.update_user
  FROM project_summary_contact psc, project pr, project_summary ps
  WHERE psc.project_summary_guid = ps.project_summary_guid and pr.project_guid = ps.project_guid;

-- Drop legacy tables, columns, and constraints
ALTER TABLE project_summary
DROP CONSTRAINT IF EXISTS mine_guid_fkey,
DROP COLUMN IF EXISTS mine_guid,
DROP CONSTRAINT IF EXISTS project_summary_lead_party_guid_fkey,
DROP COLUMN IF EXISTS project_summary_lead_party_guid,
DROP COLUMN IF EXISTS project_summary_title,
DROP COLUMN IF EXISTS proponent_project_id;