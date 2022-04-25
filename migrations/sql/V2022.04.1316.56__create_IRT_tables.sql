CREATE TABLE IF NOT EXISTS requirements (
  requirement_guid                uuid DEFAULT gen_random_uuid()        PRIMARY KEY,
  requirement_id                  serial                                   NOT NULL,
  parent_requirement_id	          integer                                          ,
  "description"                   character varying(300)                           ,
  display_order                   integer                                  NOT NULL,
  deleted_ind                     boolean DEFAULT false                    NOT NULL,
  create_user                     character varying(60)                    NOT NULL,
  create_timestamp                timestamp with time zone DEFAULT now()   NOT NULL,
  update_user                     character varying(60)                    NOT NULL,
  update_timestamp                timestamp with time zone DEFAULT now()   NOT NULL,

  CONSTRAINT requirement_id UNIQUE (requirement_id),
  CONSTRAINT parent_requirement_id_fkey FOREIGN KEY (parent_requirement_id) REFERENCES requirements(requirement_id)
);
ALTER TABLE requirements OWNER TO mds;
--
-- Name: TABLE requirements; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE requirements IS 'All requirements available to be used in Information Requirements Table (IRT). ';


CREATE TABLE IF NOT EXISTS information_requirements_table_status_code (
  status_code                     character varying(3)                 PRIMARY KEY,
  "description"                   character varying(100)                  NOT NULL,
  active_ind                      boolean DEFAULT true                    NOT NULL,
  create_user                     character varying(60)                   NOT NULL,
  create_timestamp                timestamp with time zone DEFAULT now()  NOT NULL,
  update_user                     character varying(60)                   NOT NULL,
  update_timestamp                timestamp with time zone DEFAULT now()  NOT NULL
);
ALTER TABLE information_requirements_table_status_code OWNER TO mds;
--
-- Name: TABLE information_requirements_table_status_code; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE information_requirements_table_status_code IS 'Information Requirements Table (IRT) status. ';


insert into information_requirements_table_status_code(status_code, description, create_user, update_user)
   values
   ('REC','Received', 'system-mds','system-mds'),
   ('UNR','Under review - with reviewers', 'system-mds','system-mds'),
   ('APV','Approved', 'system-mds','system-mds');

  
insert into requirements (requirement_id, description, display_order, create_user, update_user)
  values
    (1, 'Introduction and Project Overview', 1, 'system-mds','system-mds'),
    (2, 'Baseline Information', 2, 'system-mds','system-mds'),
    (3, 'Mine Plan', 3, 'system-mds','system-mds'),
    (4, 'Reclamation and Closure Plan', 4, 'system-mds','system-mds'),
    (5, 'Modelling, Mitigation, and Discharges', 5, 'system-mds','system-mds'),
    (6, 'Environmental Assessment Predictions', 6, 'system-mds','system-mds'),
    (7, 'Environmental Monitoring', 7, 'system-mds','system-mds'),
    (8, 'Health and Safety', 8, 'system-mds','system-mds'),
    (9, 'Management Plans', 9, 'system-mds','system-mds')
on conflict do nothing;

insert into requirements (requirement_id, parent_requirement_id, description, display_order,create_user, update_user)
  values
    (10,1,'Application Background', 1, 'system-mds', 'system-mds'),
    (11,1,'Proponent Information', 2, 'system-mds', 'system-mds'),
    (12,1,'Project Overview', 3, 'system-mds', 'system-mds'),
    (13,1,'Regulatory Framework', 4, 'system-mds', 'system-mds'),
    (14,1,'Indigenous Engagement', 5, 'system-mds', 'system-mds'),

    (15,2,'Summary', 1, 'system-mds', 'system-mds'),
    (16,2,'Meteorology and Climate', 2, 'system-mds', 'system-mds'),
    (17,2,'Geology', 3, 'system-mds', 'system-mds'),
    (18,2,'Geochemical Characterisation and Source Terms', 4, 'system-mds', 'system-mds'),
    (19,2,'Topography and Surface Drainage Features', 5, 'system-mds', 'system-mds'),
    (20,2,'Water Quantity', 6, 'system-mds', 'system-mds'),
    (21,2,'Sediment Quality', 7, 'system-mds', 'system-mds'),
    (22,2,'Fisheries and Aquatic Resources', 8, 'system-mds', 'system-mds'),
    (23,2,'Ecosystems and Wildlife', 9, 'system-mds', 'system-mds'),
    (24,2,'Land Status and Use', 10, 'system-mds', 'system-mds'),
    (25,2,'Archaeology', 11, 'system-mds', 'system-mds'),
    (26,2,'Cultural Use', 12, 'system-mds', 'system-mds'),

    (27,3,'Mine Plan Overview', 1, 'system-mds', 'system-mds'),
    (28,3,'Existing Development', 2, 'system-mds', 'system-mds'),
    (29,3,'Life of Mine Plan', 3, 'system-mds', 'system-mds'),
    (30,3,'Detailed Five Year Mine Plan', 4, 'system-mds', 'system-mds'),
    (31,3,'Mine Facility Designs and Development', 5, 'system-mds', 'system-mds'),

    (32,4,'End Land Use and Capability Objectives', 1, 'system-mds', 'system-mds'),
    (33,4,'Reclamation Approaches', 2, 'system-mds', 'system-mds'),
    (34,4,'Trace Element Uptake in Soils and Vegetation', 3, 'system-mds', 'system-mds'),
    (35,4,'Contaminated Sites, Human Health and Ecological Risk Assessment', 4, 'system-mds', 'system-mds'),
    (36,4,'Disposal of Chemicals, Reagents, Hazardous Materials and Contaminated Materials', 5, 'system-mds', 'system-mds'),
    (37,4,'Groundwater Well Decommissioning', 6, 'system-mds', 'system-mds'),
    (38,4,'Reclamation and Closure Prescriptions', 7, 'system-mds', 'system-mds'),
    (39,4,'Detailed Five-Year Mine Reclamation Plan', 8, 'system-mds', 'system-mds'),
    (40,4,'Temporary Shutdown', 9, 'system-mds', 'system-mds'),
    (41,4,'Post-Closure Monitoring and Maintenance', 10, 'system-mds', 'system-mds'),
    (42,4,'Reclamation Cost Estimate', 11, 'system-mds', 'system-mds'),

    (42,5,'Summary', 1, 'system-mds', 'system-mds'),
    (43,5,'Conceptual Site Model', 2, 'system-mds', 'system-mds'),
    (44,5,'Site-Wide Water Balance Model', 3, 'system-mds', 'system-mds'),
    (45,5,'Surface Water Quality Model', 4, 'system-mds', 'system-mds'),
    (46,5,'Groundwater Model', 5, 'system-mds', 'system-mds'),
    (47,5,'Mitigation Methods', 6, 'system-mds', 'system-mds'),
    (48,5,'Domestic Water/Sewage Treatment', 7, 'system-mds', 'system-mds'),
    (49,5,'Effluent Discharge', 8, 'system-mds', 'system-mds'),
    (50,5,'Initial Dilution Zone', 9, 'system-mds', 'system-mds'),

    (51,6,'Aquatic Resources', 1, 'system-mds', 'system-mds'),
    (52,6,'Terrestrial Resources', 2, 'system-mds', 'system-mds'),

    (53,7,'Environmental Monitoring Program Design', 1, 'system-mds', 'system-mds'),
    (54,7,'Mine Site Water Monitoring Program', 2, 'system-mds', 'system-mds'),
    (55,7,'Discharge Monitoring Program', 3, 'system-mds', 'system-mds'),
    (56,7,'Environment Monitoring Program', 4, 'system-mds', 'system-mds'),
    (57,7,'Post-Closure Environmental Monitoring Program', 5, 'system-mds', 'system-mds'),
    (58,7,'Aquatic Effect Monitoring Program', 6, 'system-mds', 'system-mds'),

    (59,8,'Occupational Health and Safety Program', 1, 'system-mds', 'system-mds'),
    (60,8,'Post-Permitting Requirements', 2, 'system-mds', 'system-mds'),

    (61,9,'Environmental Management System', 1, 'system-mds', 'system-mds'),
    (62,9,'Surface Erosion Prevention and Sediment Control Plan', 2, 'system-mds', 'system-mds'),
    (63,9,'Soil Management Plan', 3, 'system-mds', 'system-mds'),
    (64,9,'Construction Environmental Management Plan', 4, 'system-mds', 'system-mds'),
    (65,9,'ML/ARD Management Plan ', 5, 'system-mds', 'system-mds'),
    (66,9,'Mine Site Water Management Plan', 6, 'system-mds', 'system-mds'),
    (67,9,'Discharge Management Plan', 7, 'system-mds', 'system-mds'),
    (68,9,'Vegetation Management Plan', 8, 'system-mds', 'system-mds'),
    (69,9,'Invasive Plant Management Plan', 9, 'system-mds', 'system-mds'),
    (70,9,'Wildlife Management Plan', 10, 'system-mds', 'system-mds'),
    (71,9,'Archaeological Management and Impact Mitigation Plan', 11, 'system-mds', 'system-mds'),
    (72,9,'Mine Emergency Response Plan', 12, 'system-mds', 'system-mds'),
    (73,9,'Mine Site Traffic Control Plan', 13, 'system-mds', 'system-mds'),
    (74,9,'Fuel Management and Spill Control Plan ', 14, 'system-mds', 'system-mds'),
    (75,9,'Combustible Dust Management Plan', 15, 'system-mds', 'system-mds'),
    (76,9,'Chemicals and Materials Storage, Transfer, and Handling Plan', 16, 'system-mds', 'system-mds'),
    (77,9,'Waste (Refuse and Emissions) Management Plan ', 17, 'system-mds', 'system-mds')
on conflict do nothing;

insert into requirements (requirement_id, parent_requirement_id, description, display_order, create_user, update_user)
  values    
    (78,12,'Project History', 1, 'system-mds', 'system-mds'),
    (79,12,'Overview of Products and Markets, and Projected Project Benefits', 2, 'system-mds', 'system-mds'),
    (80,12,'Location, Access and Land Use', 3, 'system-mds', 'system-mds'),
    (81,12,'Mine Components and Off-Site Infrastructure', 4, 'system-mds', 'system-mds'),
    (82,12,'Mine Development and Operations', 5, 'system-mds', 'system-mds'),
    (83,12,'Mine Design and Assessment Team', 6, 'system-mds', 'system-mds'),
    (84,12,'Spatial Data', 7, 'system-mds', 'system-mds'),
    (85,12,'Concordance with Environmental Assessment Conditions', 8, 'system-mds', 'system-mds'),

    (86,14,'Background', 1, 'system-mds', 'system-mds'),
    (87,14,'Asserted and Established Rights and Interests', 2, 'system-mds', 'system-mds'),
    (88,14,'Engagement Efforts', 3, 'system-mds', 'system-mds'),

    (89,17,'Regional Geology', 1, 'system-mds', 'system-mds'),
    (90,17,'Deposit (Ore) Geology', 2, 'system-mds', 'system-mds'),
    (91,17,'Surficial Geology, Terrain, and Geohazard Mapping', 3, 'system-mds', 'system-mds'),
    (92,17,'Natural and Seismic Hazards Assessments', 4, 'system-mds', 'system-mds'),
    (93,17,'Soil Survey and Soil Characterization for Reclamation', 5, 'system-mds', 'system-mds'),

    (94,18,'Geochemical Characterization', 1, 'system-mds', 'system-mds'),
    (95,18,'Geochemical Source Terms', 2, 'system-mds', 'system-mds'),

    (96,20,'Surface Water Quantity', 1, 'system-mds', 'system-mds'),
    (97,20,'Groundwater Quantity', 2, 'system-mds', 'system-mds'),

    (98,22,'Periphyton and Benthic Invertebrate Community Measures ', 1, 'system-mds', 'system-mds'),
    (99,22,'Fish and Fish Habitat', 2, 'system-mds', 'system-mds'),
    (100,22,'Tissue Residues', 3, 'system-mds', 'system-mds'),

    (101,31,'Open Pits', 1, 'system-mds', 'system-mds'),
    (102,31,'Underground Workings', 2, 'system-mds', 'system-mds'),
    (103,31,'Processing Plant (Mill) and Associated Facilities', 3, 'system-mds', 'system-mds'),
    (104,31,'Tailings Storage Facility and Associated Infrastructure', 4, 'system-mds', 'system-mds'),
    (105,31,'Waste Rock Dumps', 5, 'system-mds', 'system-mds'),
    (106,31,'Water Management Structures', 6, 'system-mds', 'system-mds'),
    (107,31,'Ore, Overburden, Soil and Construction Stockpiles', 7, 'system-mds', 'system-mds'),
    (108,31,'Mine Access and Mine Haulage Roads', 8, 'system-mds', 'system-mds'),
    (109,31,'Power Supply and Distribution Infrastructure', 9, 'system-mds', 'system-mds'),
    (110,31,'Explosives Storage Facilities', 10, 'system-mds', 'system-mds'),
    (111,31,'Ancillary Facilities and Support Infrastructure', 11, 'system-mds', 'system-mds'),

    (112,33,'Soil Resources', 1, 'system-mds', 'system-mds'),
    (113,33,'Landform Design and Erosion Control', 2, 'system-mds', 'system-mds'),
    (114,33,'Revegetation Strategy', 3, 'system-mds', 'system-mds'),
    (115,33,'Progressive Reclamation/Sequencing', 4, 'system-mds', 'system-mds'),
    (116,33,'Reclamation Research ', 5, 'system-mds', 'system-mds'),
    (117,33,'Reclamation Monitoring', 6, 'system-mds', 'system-mds'),
    (118,33,'Habitat Compensation Works', 7, 'system-mds', 'system-mds'),

    (119,38,'Structures and Equipment', 1, 'system-mds', 'system-mds'),
    (120,38,'Waste Rock Dump Reclamation ', 2, 'system-mds', 'system-mds'),
    (121,38,'Tailings Storage Facility Reclamation', 3, 'system-mds', 'system-mds'),
    (122,38,'Open Pit Reclamation Prescriptions', 4, 'system-mds', 'system-mds'),
    (123,38,'Watercourse Reclamation Prescriptions', 5, 'system-mds', 'system-mds'),
    (124,38,'Road Reclamation', 6, 'system-mds', 'system-mds'),
    (125,38,'Schedule', 7, 'system-mds', 'system-mds'),

    (126,41,'Conventional Reclamation and Closure', 1, 'system-mds', 'system-mds'),
    (127,41,'Post-Closure Monitoring', 2, 'system-mds', 'system-mds'),
    (128,41,'Post-Closure Maintenance (excluding Water Treatment) ', 3, 'system-mds', 'system-mds'),
    (129,41,'Life of Mine Water Treatment', 4, 'system-mds', 'system-mds'),

    (130,46,'Conceptual Hydrogeologic Model ', 1, 'system-mds', 'system-mds'),
    (131,46,'Numeric Hydrogeologic Model', 2, 'system-mds', 'system-mds'),

    (132,47,'Best Achievable Technology Evaluation', 1, 'system-mds', 'system-mds'),
    (133,47,'Volume and Quantity Control Methods', 2, 'system-mds', 'system-mds'),
    (134,47,'Geochemical Attenuation Processes', 3, 'system-mds', 'system-mds'),
    (135,47,'Water Treatment', 4, 'system-mds', 'system-mds'),

    (136,59,'Occupational Health Risk Assessment', 1, 'system-mds', 'system-mds'),
    (137,59,'Ergonomics', 2, 'system-mds', 'system-mds'),
    (138,59,'Emergency Wash Facilities', 3, 'system-mds', 'system-mds'),
    (139,59,'Hazardous Dust', 4, 'system-mds', 'system-mds'),
    (140,59,'Lunchrooms, Mine Dry, and Sanitary Conveniences', 5, 'system-mds', 'system-mds'),

    (141,60,'Issued for Construction Plans', 1, 'system-mds', 'system-mds'),
    (142,60,'Letters of Assurance', 2, 'system-mds', 'system-mds'),
    (143,60,'Occupational Health Programs', 3, 'system-mds', 'system-mds'),
    (144,60,'Workplace Hazardous Materials Information System (WHMIS)', 4, 'system-mds', 'system-mds'),
    (145,60,'Additional Information and Certifications', 5, 'system-mds', 'system-mds')
on conflict do nothing;

insert into requirements (requirement_id, parent_requirement_id, description, display_order, create_user, update_user)
  values     
    (146,135,'Description', 1, 'system-mds', 'system-mds'),
    (147,135,'Location', 2, 'system-mds', 'system-mds'),
    (148,135,'Detailed Design', 3, 'system-mds', 'system-mds'),
    (149,135,'Treatment Effectiveness', 4, 'system-mds', 'system-mds'),
    (150,135,'Performance Risks', 5, 'system-mds', 'system-mds'),
    (151,135,'Influent and Effluent Water Quality', 6, 'system-mds', 'system-mds'),
    (152,135,'Waste and By-Products', 7, 'system-mds', 'system-mds'),
    (153,135,'Maintenance', 8, 'system-mds', 'system-mds'),
    (154,135,'Emergency Response Plans', 9, 'system-mds', 'system-mds'),
    (155,135,'Monitoring Plans', 10, 'system-mds', 'system-mds'),
    (156,135,'Schedule', 11, 'system-mds', 'system-mds'),
    (157,135,'Cost Estimate', 12, 'system-mds', 'system-mds')
on conflict do nothing;

DO
$$
BEGIN
   EXECUTE format('
   DROP SEQUENCE IF EXISTS public.requirements_requirement_id_seq CASCADE;
   CREATE SEQUENCE IF NOT EXISTS public.requirements_requirement_id_seq
   INCREMENT 1
   START %1$s
   MINVALUE %1$s
   NO MAXVALUE
   CACHE 1;'
 , (SELECT COALESCE ((SELECT MAX(requirement_id) FROM requirements),0) +1));
   ALTER SEQUENCE public.requirements_requirement_id_seq OWNER TO mds;
   GRANT ALL ON SEQUENCE public.requirements_requirement_id_seq TO mds;
   ALTER TABLE ONLY public.requirements ALTER COLUMN requirement_id SET DEFAULT nextval('public.requirements_requirement_id_seq'::regclass);
END
$$;

CREATE TABLE IF NOT EXISTS information_requirements_table (
  irt_guid                         uuid DEFAULT gen_random_uuid()       PRIMARY KEY,
  irt_id                           serial                                  NOT NULL,
  project_guid                     uuid                                    NOT NULL,
  status_code                      character varying(3)                    NOT NULL,
  deleted_ind                      boolean DEFAULT false                   NOT NULL,
  create_user                      character varying(60)                   NOT NULL,
  create_timestamp                 timestamp with time zone DEFAULT now()  NOT NULL,
  update_user                      character varying(60)                   NOT NULL,
  update_timestamp                 timestamp with time zone DEFAULT now()  NOT NULL,
  
  CONSTRAINT irt_id UNIQUE (irt_id),
  CONSTRAINT project_guid_fkey FOREIGN KEY (project_guid) REFERENCES project(project_guid),
  CONSTRAINT status_code_fkey FOREIGN KEY (status_code) REFERENCES information_requirements_table_status_code(status_code)
);
ALTER TABLE information_requirements_table OWNER TO mds;
--
-- Name: TABLE irt; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE information_requirements_table IS 'Information Requirements Table (IRT) associated to a project. ';

CREATE TABLE IF NOT EXISTS irt_requirements_xref (
  irt_requirements_xref_guid       uuid    DEFAULT gen_random_uuid()       PRIMARY KEY, 
  irt_guid                         uuid                                    NOT NULL, 
  requirement_guid                 uuid                                    NOT NULL, 
  deleted_ind                      boolean DEFAULT false                   NOT NULL,
  create_user                      character varying(60)                   NOT NULL,
  create_timestamp                 timestamp with time zone DEFAULT now()  NOT NULL,
  update_user                      character varying(60)                   NOT NULL,
  update_timestamp                 timestamp with time zone DEFAULT now()  NOT NULL,
  "required"                       boolean default false                   NOT NULL,
  methods                          boolean default false                   NOT NULL,
  "comment"                        character varying(3000)                         ,

  CONSTRAINT irt_requirement_guid UNIQUE (irt_guid, requirement_guid),
  CONSTRAINT irt_requirements_xref_irt_guid FOREIGN KEY (irt_guid) REFERENCES information_requirements_table(irt_guid),
  CONSTRAINT irt_requirements_xref_requirement_guid FOREIGN KEY (requirement_guid) REFERENCES requirements(requirement_guid)
);
ALTER TABLE irt_requirements_xref OWNER TO mds;
--
-- Name: TABLE irt_requirements_xref; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE irt_requirements_xref IS 'Reference table between Information Requirements Table (IRT) and associated requirements. ';
