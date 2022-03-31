CREATE TABLE IF NOT EXISTS irt_condition (
  condition_guid                  uuid DEFAULT gen_random_uuid()        PRIMARY KEY,
  condition_id                    serial                                   NOT NULL,
  parent_condition_id	            integer                                          ,
  "description"                   character varying(300)                           ,
  active_ind                      boolean DEFAULT true                     NOT NULL,
  create_user                     character varying(60)                    NOT NULL,
  create_timestamp                timestamp with time zone DEFAULT now()   NOT NULL,
  update_user                     character varying(60)                    NOT NULL,
  update_timestamp                timestamp with time zone DEFAULT now()   NOT NULL,

  CONSTRAINT condition_id UNIQUE (condition_id),
  CONSTRAINT parent_condition_id_fkey FOREIGN KEY (parent_condition_id) REFERENCES irt_condition(condition_id)
);
ALTER TABLE irt_condition OWNER TO mds;
--
-- Name: TABLE irt_condition; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE irt_condition IS 'IRT condition. ';


CREATE TABLE IF NOT EXISTS irt_status_code (
  status_code                     character varying(3)                 PRIMARY KEY,
  "description"                   character varying(100)                  NOT NULL,
  active_ind                      boolean DEFAULT true                    NOT NULL,
  create_user                     character varying(60)                   NOT NULL,
  create_timestamp                timestamp with time zone DEFAULT now()  NOT NULL,
  update_user                     character varying(60)                   NOT NULL,
  update_timestamp                timestamp with time zone DEFAULT now()  NOT NULL
);
ALTER TABLE irt_status_code OWNER TO mds;
--
-- Name: TABLE irt_status_code; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE irt_status_code IS 'IRT status. ';


insert into irt_status_code(status_code, description, active_ind, create_user, update_user)
   values('REC','Received', true,'system-mds','system-mds');
  
 insert into irt_status_code(status_code, description, active_ind, create_user, update_user)
   values('UNR','Under review - with reviewers', true,'system-mds','system-mds');
  
 insert into irt_status_code(status_code, description, active_ind, create_user, update_user)
   values('APV','Approved', true,'system-mds','system-mds');

  
insert into irt_condition (condition_id, description, active_ind, create_user, update_user)
  values
    (1, 'Introduction and Project Overview', true, 'system-mds','system-mds'),
    (2, 'Baseline Information', true, 'system-mds','system-mds'),
    (3, 'Mine Plan', true, 'system-mds','system-mds'),
    (4, 'Reclamation and Closure Plan', true, 'system-mds','system-mds'),
    (5, 'Modelling, Mitigation, and Discharges', true, 'system-mds','system-mds'),
    (6, 'Environmental Assessment Predictions', true, 'system-mds','system-mds'),
    (7, 'Environmental Monitoring', true, 'system-mds','system-mds'),
    (8, 'Health and Safety', true, 'system-mds','system-mds'),
    (9, 'Management Plans', true, 'system-mds','system-mds')
on conflict do nothing;

insert into irt_condition (condition_id, parent_condition_id, description, active_ind, create_user, update_user)
  values
    (10,1,'Application Background', true, 'system-mds', 'system-mds'),
    (11,1,'Proponent Information', true, 'system-mds', 'system-mds'),
    (12,1,'Project Overview', true, 'system-mds', 'system-mds'),
    (13,1,'Regulatory Framework', true, 'system-mds', 'system-mds'),
    (14,1,'Indigenous Engagement', true, 'system-mds', 'system-mds'),
    (15,2,'Summary', true, 'system-mds', 'system-mds'),
    (16,2,'Meteorology and Climate', true, 'system-mds', 'system-mds'),
    (17,2,'Geology', true, 'system-mds', 'system-mds'),
    (18,2,'Geochemical Characterisation and Source Terms', true, 'system-mds', 'system-mds'),
    (19,2,'Topography and Surface Drainage Features', true, 'system-mds', 'system-mds'),
    (20,2,'Water Quantity', true, 'system-mds', 'system-mds'),
    (21,2,'Sediment Quality', true, 'system-mds', 'system-mds'),
    (22,2,'Fisheries and Aquatic Resources', true, 'system-mds', 'system-mds'),
    (23,2,'Ecosystems and Wildlife', true, 'system-mds', 'system-mds'),
    (24,2,'Land Status and Use', true, 'system-mds', 'system-mds'),
    (25,2,'Archaeology', true, 'system-mds', 'system-mds'),
    (26,2,'Cultural Use', true, 'system-mds', 'system-mds'),
    (27,3,'Mine Plan Overview', true, 'system-mds', 'system-mds'),
    (28,3,'Existing Development', true, 'system-mds', 'system-mds'),
    (29,3,'Life of Mine Plan', true, 'system-mds', 'system-mds'),
    (30,3,'Detailed Five Year Mine Plan', true, 'system-mds', 'system-mds'),
    (31,3,'Mine Facility Designs and Development', true, 'system-mds', 'system-mds'),
    (32,4,'End Land Use and Capability Objectives', true, 'system-mds', 'system-mds'),
    (33,4,'Reclamation Approaches', true, 'system-mds', 'system-mds'),
    (34,4,'Trace Element Uptake in Soils and Vegetation', true, 'system-mds', 'system-mds'),
    (35,4,'Contaminated Sites, Human Health and Ecological Risk Assessment', true, 'system-mds', 'system-mds'),
    (36,4,'Disposal of Chemicals, Reagents, Hazardous Materials and Contaminated Materials', true, 'system-mds', 'system-mds'),
    (37,4,'Groundwater Well Decommissioning', true, 'system-mds', 'system-mds'),
    (38,4,'Reclamation and Closure Prescriptions', true, 'system-mds', 'system-mds'),
    (39,4,'Temporary Shutdown', true, 'system-mds', 'system-mds'),
    (40,4,'Post-Closure Monitoring and Maintenance', true, 'system-mds', 'system-mds'),
    (41,4,'Reclamation Cost Estimate', true, 'system-mds', 'system-mds'),
    (42,5,'Summary', true, 'system-mds', 'system-mds'),
    (43,5,'Conceptual Site Model', true, 'system-mds', 'system-mds'),
    (44,5,'Site-Wide Water Balance Model', true, 'system-mds', 'system-mds'),
    (45,5,'Surface Water Quality Model', true, 'system-mds', 'system-mds'),
    (46,5,'Groundwater Model', true, 'system-mds', 'system-mds'),
    (47,5,'Mitigation Methods', true, 'system-mds', 'system-mds'),
    (48,5,'Domestic Water/Sewage Treatment', true, 'system-mds', 'system-mds'),
    (49,5,'Effluent Discharge', true, 'system-mds', 'system-mds'),
    (50,5,'Initial Dilution Zone', true, 'system-mds', 'system-mds'),
    (51,6,'Aquatic Resources', true, 'system-mds', 'system-mds'),
    (52,6,'Terrestrial Resources', true, 'system-mds', 'system-mds'),
    (53,7,'Environmental Monitoring Program Design', true, 'system-mds', 'system-mds'),
    (54,7,'Mine Site Water Monitoring Program', true, 'system-mds', 'system-mds'),
    (55,7,'Discharge Monitoring Program', true, 'system-mds', 'system-mds'),
    (56,7,'Environment Monitoring Program', true, 'system-mds', 'system-mds'),
    (57,7,'Post-Closure Environmental Monitoring Program', true, 'system-mds', 'system-mds'),
    (58,7,'Aquatic Effect Monitoring Program', true, 'system-mds', 'system-mds'),
    (59,8,'Occupational Health and Safety Program', true, 'system-mds', 'system-mds'),
    (60,8,'Post-Permitting Requirements', true, 'system-mds', 'system-mds'),
    (61,9,'Environmental Management System', true, 'system-mds', 'system-mds'),
    (62,9,'Surface Erosion Prevention and Sediment Control Plan', true, 'system-mds', 'system-mds'),
    (63,9,'Soil Management Plan', true, 'system-mds', 'system-mds'),
    (64,9,'Construction Environmental Management Plan', true, 'system-mds', 'system-mds'),
    (65,9,'ML/ARD Management Plan ', true, 'system-mds', 'system-mds'),
    (66,9,'Mine Site Water Management Plan', true, 'system-mds', 'system-mds'),
    (67,9,'Discharge Management Plan', true, 'system-mds', 'system-mds'),
    (68,9,'Vegetation Management Plan', true, 'system-mds', 'system-mds'),
    (69,9,'Invasive Plant Management Plan', true, 'system-mds', 'system-mds'),
    (70,9,'Wildlife Management Plan', true, 'system-mds', 'system-mds'),
    (71,9,'Archaeological Management and Impact Mitigation Plan', true, 'system-mds', 'system-mds'),
    (72,9,'Mine Emergency Response Plan', true, 'system-mds', 'system-mds'),
    (73,9,'Mine Site Traffic Control Plan', true, 'system-mds', 'system-mds'),
    (74,9,'Fuel Management and Spill Control Plan ', true, 'system-mds', 'system-mds'),
    (75,9,'Combustible Dust Management Plan', true, 'system-mds', 'system-mds'),
    (76,9,'Chemicals and Materials Storage, Transfer, and Handling Plan', true, 'system-mds', 'system-mds'),
    (77,9,'Waste (Refuse and Emissions) Management Plan ', true, 'system-mds', 'system-mds')
on conflict do nothing;

insert into irt_condition (condition_id, parent_condition_id, description, active_ind, create_user, update_user)
  values    
    (78,12,'Project History', true, 'system-mds', 'system-mds'),
    (79,12,'Overview of Products and Markets, and Projected Project Benefits', true, 'system-mds', 'system-mds'),
    (80,12,'Location, Access and Land Use', true, 'system-mds', 'system-mds'),
    (81,12,'Mine Components and Off-Site Infrastructure', true, 'system-mds', 'system-mds'),
    (82,12,'Mine Development and Operations', true, 'system-mds', 'system-mds'),
    (83,12,'Mine Design and Assessment Team', true, 'system-mds', 'system-mds'),
    (84,12,'Spatial Data', true, 'system-mds', 'system-mds'),
    (85,12,'Concordance with Environmental Assessment Conditions', true, 'system-mds', 'system-mds'),
    (86,14,'Background', true, 'system-mds', 'system-mds'),
    (87,14,'Asserted and Established Rights and Interests', true, 'system-mds', 'system-mds'),
    (88,14,'Engagement Efforts', true, 'system-mds', 'system-mds'),
    (89,17,'Regional Geology', true, 'system-mds', 'system-mds'),
    (90,17,'Deposit (Ore) Geology', true, 'system-mds', 'system-mds'),
    (91,17,'Surficial Geology, Terrain, and Geohazard Mapping', true, 'system-mds', 'system-mds'),
    (92,17,'Natural and Seismic Hazards Assessments', true, 'system-mds', 'system-mds'),
    (93,17,'Soil Survey and Soil Characterization for Reclamation', true, 'system-mds', 'system-mds'),
    (94,18,'Geochemical Characterization', true, 'system-mds', 'system-mds'),
    (95,18,'Geochemical Source Terms', true, 'system-mds', 'system-mds'),
    (96,20,'Surface Water Quantity', true, 'system-mds', 'system-mds'),
    (97,20,'Groundwater Quantity', true, 'system-mds', 'system-mds'),
    (98,22,'Periphyton and Benthic Invertebrate Community Measures ', true, 'system-mds', 'system-mds'),
    (99,22,'Fish and Fish Habitat', true, 'system-mds', 'system-mds'),
    (100,22,'Tissue Residues', true, 'system-mds', 'system-mds'),
    (101,31,'Open Pits', true, 'system-mds', 'system-mds'),
    (102,31,'Underground Workings', true, 'system-mds', 'system-mds'),
    (103,31,'Processing Plant (Mill) and Associated Facilities', true, 'system-mds', 'system-mds'),
    (104,31,'Tailings Storage Facility and Associated Infrastructure', true, 'system-mds', 'system-mds'),
    (105,31,'Waste Rock Dumps', true, 'system-mds', 'system-mds'),
    (106,31,'Water Management Structures', true, 'system-mds', 'system-mds'),
    (107,31,'Ore, Overburden, Soil and Construction Stockpiles', true, 'system-mds', 'system-mds'),
    (108,31,'Mine Access and Mine Haulage Roads', true, 'system-mds', 'system-mds'),
    (109,31,'Power Supply and Distribution Infrastructure', true, 'system-mds', 'system-mds'),
    (110,31,'Explosives Storage Facilities', true, 'system-mds', 'system-mds'),
    (111,31,'Ancillary Facilities and Support Infrastructure', true, 'system-mds', 'system-mds'),
    (112,33,'Soil Resources', true, 'system-mds', 'system-mds'),
    (113,33,'Landform Design and Erosion Control', true, 'system-mds', 'system-mds'),
    (114,33,'Revegetation Strategy', true, 'system-mds', 'system-mds'),
    (115,33,'Progressive Reclamation/Sequencing', true, 'system-mds', 'system-mds'),
    (116,33,'Reclamation Research ', true, 'system-mds', 'system-mds'),
    (117,33,'Reclamation Monitoring', true, 'system-mds', 'system-mds'),
    (118,33,'Habitat Compensation Works', true, 'system-mds', 'system-mds'),
    (119,38,'Structures and Equipment', true, 'system-mds', 'system-mds'),
    (120,38,'Waste Rock Dump Reclamation ', true, 'system-mds', 'system-mds'),
    (121,38,'Tailings Storage Facility Reclamation', true, 'system-mds', 'system-mds'),
    (122,38,'Open Pit Reclamation Prescriptions', true, 'system-mds', 'system-mds'),
    (123,38,'Watercourse Reclamation Prescriptions', true, 'system-mds', 'system-mds'),
    (124,38,'Road Reclamation', true, 'system-mds', 'system-mds'),
    (125,38,'Schedule', true, 'system-mds', 'system-mds'),
    (126,41,'Conventional Reclamation and Closure', true, 'system-mds', 'system-mds'),
    (127,41,'Post-Closure Monitoring', true, 'system-mds', 'system-mds'),
    (128,41,'Post-Closure Maintenance (excluding Water Treatment) ', true, 'system-mds', 'system-mds'),
    (129,41,'Life of Mine Water Treatment', true, 'system-mds', 'system-mds'),
    (130,46,'Conceptual Hydrogeologic Model ', true, 'system-mds', 'system-mds'),
    (131,46,'Numeric Hydrogeologic Model', true, 'system-mds', 'system-mds'),
    (132,47,'Best Achievable Technology Evaluation', true, 'system-mds', 'system-mds'),
    (133,47,'Volume and Quantity Control Methods', true, 'system-mds', 'system-mds'),
    (134,47,'Geochemical Attenuation Processes', true, 'system-mds', 'system-mds'),
    (135,47,'Water Treatment', true, 'system-mds', 'system-mds'),
    (136,59,'Occupational Health Risk Assessment', true, 'system-mds', 'system-mds'),
    (137,59,'Ergonomics', true, 'system-mds', 'system-mds'),
    (138,59,'Emergency Wash Facilities', true, 'system-mds', 'system-mds'),
    (139,59,'Hazardous Dust', true, 'system-mds', 'system-mds'),
    (140,59,'Lunchrooms, Mine Dry, and Sanitary Conveniences', true, 'system-mds', 'system-mds'),
    (141,60,'Issued for Construction Plans', true, 'system-mds', 'system-mds'),
    (142,60,'Letters of Assurance', true, 'system-mds', 'system-mds'),
    (143,60,'Occupational Health Programs', true, 'system-mds', 'system-mds'),
    (144,60,'Workplace Hazardous Materials Information System (WHMIS)', true, 'system-mds', 'system-mds'),
    (145,60,'Additional Information and Certifications', true, 'system-mds', 'system-mds')
on conflict do nothing;

insert into irt_condition (condition_id, parent_condition_id, description, active_ind, create_user, update_user)
  values     
    (146,135,'Description', true, 'system-mds', 'system-mds'),
    (147,135,'Location', true, 'system-mds', 'system-mds'),
    (148,135,'Detailed Design', true, 'system-mds', 'system-mds'),
    (149,135,'Treatment Effectiveness', true, 'system-mds', 'system-mds'),
    (150,135,'Performance Risks', true, 'system-mds', 'system-mds'),
    (151,135,'Influent and Effluent Water Quality', true, 'system-mds', 'system-mds'),
    (152,135,'Waste and By-Products', true, 'system-mds', 'system-mds'),
    (153,135,'Maintenance', true, 'system-mds', 'system-mds'),
    (154,135,'Emergency Response Plans', true, 'system-mds', 'system-mds'),
    (155,135,'Monitoring Plans', true, 'system-mds', 'system-mds'),
    (156,135,'Schedule', true, 'system-mds', 'system-mds'),
    (157,135,'Cost Estimate', true, 'system-mds', 'system-mds')
on conflict do nothing;

CREATE TABLE IF NOT EXISTS irt (
  irt_guid                         uuid DEFAULT gen_random_uuid()       PRIMARY KEY,
  irt_id                           serial                                  NOT NULL,
  condition_guid                   uuid                                    NOT NULL,
  "required"                       boolean default false                   NOT NULL,
  methods                          boolean default false                   NOT NULL,
  "comment"                        character varying(3000)                         ,
  status_code                      character varying(3)                    NOT NULL,
  create_user                      character varying(60)                   NOT NULL,
  create_timestamp                 timestamp with time zone DEFAULT now()  NOT NULL,
  update_user                      character varying(60)                   NOT NULL,
  update_timestamp                 timestamp with time zone DEFAULT now()  NOT NULL,
	
  CONSTRAINT irt_id UNIQUE (irt_id),
  CONSTRAINT condition_guid_fkey FOREIGN KEY (condition_guid) REFERENCES irt_condition(condition_guid),
  CONSTRAINT status_code_fkey FOREIGN KEY (status_code) REFERENCES irt_status_code(status_code)
);
ALTER TABLE irt OWNER TO mds;
--
-- Name: TABLE irt; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE irt IS 'Information Requirements Table (IRT). ';

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

-- Add foreign keys to project on children(Summary, IRT)
ALTER TABLE project_summary ADD COLUMN IF NOT EXISTS project_guid uuid;
ALTER TABLE project_summary ADD CONSTRAINT project_guid_fkey FOREIGN KEY (project_guid) REFERENCES project(project_guid);

ALTER TABLE irt ADD COLUMN IF NOT EXISTS project_guid uuid;
ALTER TABLE irt ADD CONSTRAINT project_guid_fkey FOREIGN KEY (project_guid) REFERENCES project(project_guid);


-- Before droping these columns, need to run data fix to copy data into project table

-- ALTER TABLE project_summary
-- DROP  CONSTRAINT IF EXISTS mine_guid_fkey,
-- DROP  COLUMN IF EXISTS mine_guid,
-- DROP  CONSTRAINT IF EXISTS project_summary_lead_party_guid_fkey,
-- DROP  COLUMN IF EXISTS project_summary_lead_party_guid,
-- DROP  COLUMN IF EXISTS project_summary_title,
-- DROP  COLUMN IF EXISTS proponent_project_id;

-- Data Fix:
-- Copy data from project_summary to project table (Need irt_guid field to allow null values for existing records)
-- INSERT INTO project (project_summary_guid, mine_guid, project_title, project_lead_party_guid, create_user,update_user)
--   SELECT ps.project_summary_guid, ps.mine_guid, ps.project_summary_title, ps.project_summary_lead_party_guid, 'system-mds','system-mds'
--   FROM project_summary ps
--   WHERE project_summary_id not in (select project_summary_id
-- 								   from project)
-- Copy data from project_summary_contact to project_contact by project_guid (copied in the previous query)								   
-- INSERT INTO project_contact(project_guid, name, job_title, company_name, email, phone_number, phone_extension, is_primary, deleted_ind, create_user, update_user)
--   SELECT pr.project_guid, psc.name, psc.job_title, psc.company_name, psc.email, psc.phone_number, psc.phone_extension, psc.is_primary, psc.deleted_ind, psc.create_user, psc.update_user
--   FROM project_summary_contact psc, project pr
--   WHERE psc.project_summary_guid = pr.project_summary_guid and
--         pr.project_guid not in (select project_guid
-- 							    from project_contact)

-- After ensuring irt_guid are populated in existing records:
-- ALTER TABLE project ALTER COLUMN irt_guid SET NOT NULL;
