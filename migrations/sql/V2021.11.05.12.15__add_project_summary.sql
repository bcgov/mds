CREATE TABLE IF NOT EXISTS project_summary (
    project_summary_id              serial                      PRIMARY KEY,
    project_summary_guid            uuid DEFAULT gen_random_uuid() NOT NULL,
    project_summary_description     character varying(300)                 ,
    project_summary_date            timestamp with time zone       NOT NULL,
    deleted_ind                     boolean DEFAULT false          NOT NULL,
    project_summary_status          character varying(3)           NOT NULL,

    mine_guid                       uuid                           NOT NULL,
    project_summary_lead            uuid                                   ,
    
    create_user                     character varying(60)                    NOT NULL,
    create_timestamp                timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                     character varying(60)                    NOT NULL,
    update_timestamp                timestamp with time zone DEFAULT now()   NOT NULL,

    CONSTRAINT project_summary_guid UNIQUE (project_summary_guid),
    CONSTRAINT project_summary_lead_guid_fkey FOREIGN KEY (project_summary_lead) REFERENCES party(party_guid) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE project_summary OWNER TO mds;