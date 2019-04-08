CREATE TABLE IF NOT EXISTS mine_incident_reports
(
    mine_incident_report_id         serial                      PRIMARY KEY,
    mine_incident_report_guid       uuid                        NOT NULL,
    mine_incident_report_no         character varying(20)       NOT NULL,
    mine_guid                       uuid                        NOT NULL,
    incident_timestamp              timestamp with time zone    NOT NULL, 
    incident_description            text, 
    reported_timestamp              timestamp with time zone    ,  
    reported_by                     character varying(100)      , 
    reported_by_role                character varying(100)      ,        
    dangerous_occurance_ind         boolean DEFAULT 'false' NOT NULL,
    followup_inspection_ind         boolean DEFAULT 'false' NOT NULL,
    followup_inspection_number      character varying(20),
    incident_final_report_summary   text,
    create_user                     character varying(60)                    NOT NULL,
    create_timestamp                timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                     character varying(60)                    NOT NULL,
    update_timestamp                timestamp with time zone DEFAULT now()   NOT NULL,

    CONSTRAINT mine_incident_report_guid_unique UNIQUE (mine_incident_report_guid) ,
    CONSTRAINT mine_incident_report_number UNIQUE (mine_incident_report_number) ,

    CONSTRAINT mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED
);