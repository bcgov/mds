CREATE TABLE IF NOT EXISTS project_summary_contact (
    project_summary_contact_guid        uuid DEFAULT gen_random_uuid()       PRIMARY KEY,
    project_summary_guid                uuid                                    NOT NULL,
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

    CONSTRAINT project_summary_guid_fkey FOREIGN KEY (project_summary_guid) REFERENCES project_summary(project_summary_guid)
);

COMMENT ON TABLE project_summary_status_code is 'Links proponents to project summaries.';
ALTER TABLE project_summary_contact OWNER TO mds;

CREATE TABLE IF NOT EXISTS project_summary_authorization_type (
    project_summary_authorization_type            character varying(100)                PRIMARY KEY,
    "description"                                 character varying(100)                   NOT NULL,
    project_summary_authorization_type_group_id   character varying(100)                           ,
    deleted_ind                                   boolean DEFAULT false                    NOT NULL,
    create_user                                   character varying(60)                    NOT NULL,
    create_timestamp                              timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                                   character varying(60)                    NOT NULL,
    update_timestamp                              timestamp with time zone DEFAULT now()   NOT NULL,

    CONSTRAINT project_summary_authorization_type_group_id_fkey FOREIGN KEY (project_summary_authorization_type_group_id) REFERENCES project_summary_authorization_type(project_summary_authorization_type)
);

COMMENT ON TABLE project_summary_authorization_type is 'A lookup of all project summary authorization types.';
ALTER TABLE project_summary_authorization_type OWNER TO mds;

INSERT INTO project_summary_authorization_type(project_summary_authorization_type, description, project_summary_authorization_type_group_id, create_user, update_user)
VALUES 
('MINES_ACT', 'Mines Act', null, 'system-mds', 'system-mds'),
('ENVIRONMENTAL_MANAGMENT_ACT', 'Environmental Management Act', null, 'system-mds', 'system-mds'),
('WATER_SUSTAINABILITY_ACT', 'Water Sustainability Act', null, 'system-mds', 'system-mds'),
('FORESTRY_ACT', 'Forestry Act', null, 'system-mds', 'system-mds'),
('OTHER_LEGISLATION', 'Other legislation', null, 'system-mds', 'system-mds'),
('MINES_ACT_PERMIT', 'Mines Act permit', 'MINES_ACT', 'system-mds', 'system-mds'),
('AIR_EMISSIONS_DISCHARGE_PERMIT', 'Air emissions discharge permit', 'ENVIRONMENTAL_MANAGMENT_ACT', 'system-mds', 'system-mds'),
('EFFLUENT_DISCHARGE_PERMIT', 'Effluent discharge permit', 'ENVIRONMENTAL_MANAGMENT_ACT', 'system-mds', 'system-mds'),
('SOLID_WASTES_PERMIT', 'Solid wastes permit', 'ENVIRONMENTAL_MANAGMENT_ACT', 'system-mds', 'system-mds'),
('MUNICIPAL_WASTEWATER_REGULATION', 'Municipal wastewater regulation', 'ENVIRONMENTAL_MANAGMENT_ACT', 'system-mds', 'system-mds'),
('CHANGE_APPROVAL', 'Change approval', 'WATER_SUSTAINABILITY_ACT', 'system-mds', 'system-mds'),
('USE_APPROVAL', 'Use approval', 'WATER_SUSTAINABILITY_ACT', 'system-mds', 'system-mds'),
('WATER_LICENCE', 'Water licence', 'WATER_SUSTAINABILITY_ACT', 'system-mds', 'system-mds'),
('OCCUPANT_CUT_LICENCE', 'Occupant licence to cut', 'FORESTRY_ACT', 'system-mds', 'system-mds'),
('OTHER', 'Other legislation', 'OTHER_LEGISLATION', 'system-mds', 'system-mds');


CREATE TABLE IF NOT EXISTS project_summary_permit_type (
    project_summary_permit_type                   character varying(100)                PRIMARY KEY,
    "description"                                 character varying(100)                   NOT NULL,
    deleted_ind                                   boolean DEFAULT false                    NOT NULL,
    create_user                                   character varying(60)                    NOT NULL,
    create_timestamp                              timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                                   character varying(60)                    NOT NULL,
    update_timestamp                              timestamp with time zone DEFAULT now()   NOT NULL
);

COMMENT ON TABLE project_summary_permit_type is 'A lookup of all project summary permit types.';
ALTER TABLE project_summary_permit_type OWNER TO mds;

INSERT INTO project_summary_permit_type(project_summary_permit_type, description, create_user, update_user)
VALUES
('NEW', 'New', 'system-mds', 'system-mds'),
('AMENDMENT', 'Amendement to an existing permit', 'system-mds', 'system-mds'),
('NOTIFICATION', 'Notification', 'system-mds', 'system-mds'),
('CLOSURE', 'Closure of an existing permit', 'system-mds', 'system-mds'),
('OTHER', 'Other', 'system-mds', 'system-mds');


CREATE TABLE IF NOT EXISTS project_summary_authorization (
    project_summary_authorization_guid            uuid DEFAULT gen_random_uuid()        PRIMARY KEY,
    project_summary_guid                          uuid                                     NOT NULL,
    project_summary_authorization_type            character varying(100)                   NOT NULL,
    project_summary_permit_type                   text[]                                   NOT NULL,
    existing_permits_authorizations               text[]                                   NOT NULL,
    deleted_ind                                   boolean DEFAULT false                    NOT NULL,
    create_user                                   character varying(60)                    NOT NULL,
    create_timestamp                              timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                                   character varying(60)                    NOT NULL,
    update_timestamp                              timestamp with time zone DEFAULT now()   NOT NULL,

    CONSTRAINT project_summary_guid_fkey FOREIGN KEY (project_summary_guid) REFERENCES project_summary(project_summary_guid),
    CONSTRAINT project_summary_authorization_type_fkey FOREIGN KEY (project_summary_authorization_type) REFERENCES project_summary_authorization_type(project_summary_authorization_type)
);

COMMENT ON TABLE project_summary_authorization is 'Stores all relevant authorization information for project summaries.';
ALTER TABLE project_summary_authorization OWNER TO mds;
