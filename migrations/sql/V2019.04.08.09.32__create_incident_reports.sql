CREATE TABLE IF NOT EXISTS mine_incident_followup_type
(
    mine_incident_followup_type_code                character varying(3) PRIMARY KEY,
    description                                     character varying(100),
    active_ind                                      boolean,

    create_user                                     character varying(60)                    NOT NULL,
    create_timestamp                                timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                                     character varying(60)                    NOT NULL,
    update_timestamp                                timestamp with time zone DEFAULT now()   NOT NULL,

);
ALTER TABLE mine_incident_followup_empr_action OWNER TO mds;
COMMENT ON TABLE mine_incident_followup_empr_action IS 'lookup table for the types of EMPR reactions to a given mine_incident.';

CREATE TABLE IF NOT EXISTS mine_incident
(
    mine_incident_id                serial                      PRIMARY KEY,
    mine_incident_id_year           integer                     NOT NULL,
    mine_incident_guid              uuid                        NOT NULL,

    mine_guid                       uuid                        NOT NULL,

    incident_timestamp              timestamp with time zone    NOT NULL, 
    incident_description            text                        NOT NULL, 
    
    reported_timestamp              timestamp with time zone    ,  
    reported_by                     character varying(100)      , 
    reported_by_role                character varying(100)      ,        

    followup_type_code              character varying(3)    NOT NULL,
    followup_inspection_no          character varying(20)           ,
    
    closing_report_summary          text                            ,
    
    create_user                     character varying(60)                    NOT NULL,
    create_timestamp                timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                     character varying(60)                    NOT NULL,
    update_timestamp                timestamp with time zone DEFAULT now()   NOT NULL,

    CONSTRAINT mine_incident_guid_unique UNIQUE (mine_incident_guid),
    CONSTRAINT mine_incident_year_no_unique UNIQUE (mine_incident_year, mine_incident_no),

    CONSTRAINT mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT mine_incident_followup_fkey FOREIGN KEY (followup_type_code) REFERENCES mine_incident_followup_type(mine_incident_followup_type_code) DEFERRABLE INITIALLY DEFERRED
);
ALTER TABLE mine_incident OWNER TO mds;
COMMENT ON TABLE mine_incident IS 'A list of incidents that have occured on a given mine including; incidents, dangerous occurances, and lose of life';