CREATE TABLE IF NOT EXISTS project_link (
    project_link_guid UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_guid UUID NOT NULL,
    related_project_guid UUID NOT NULL,    
    create_user           	character varying(60)						NOT NULL,
    update_user           	character varying(60)						NOT NULL,
    create_timestamp      	timestamp with time zone DEFAULT now()		NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    FOREIGN KEY (project_guid) REFERENCES project(project_guid),
    FOREIGN KEY (related_project_guid) REFERENCES project(project_guid)
);