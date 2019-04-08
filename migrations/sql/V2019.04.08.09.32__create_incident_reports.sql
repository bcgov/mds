CREATE TABLE IF NOT EXISTS mine_incident_reports
(
    mine_incident_report_id     serial                      PRIMARY KEY,
    mine_incident_report_guid   uuid                        NOT NULL,
    mine_incident_report_number integer                     NOT NULL,
    mine_guid                   uuid                        NOT NULL,
    reported_timestamp          timestamp with time zone    NOT NULL,             
    incident_timestamp          timestamp with time zone    NOT NULL, 
    reported_by                 character varying(100)      NOT NULL, 
    reported_by_title           character varying(100)      NOT NULL, 
    followup_inspection_ind     boolean,
    followup_inspection_number  character varying(20),
    dangerous_occurance_ind     boolean DEFAULT 'false',
    incident_description        text, 
    incident_prevention_plan    text,
    create_user                 character varying(60)                    NOT NULL,
    create_timestamp            timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                 character varying(60)                    NOT NULL,
    update_timestamp            timestamp with time zone DEFAULT now()   NOT NULL,


    CONSTRAINT mine_incident_report_guid_unique UNIQUE (mine_incident_report_guid) ,
    CONSTRAINT mine_incident_report_number UNIQUE (mine_incident_report_number) ,

    CONSTRAINT mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED
);