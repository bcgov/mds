CREATE TABLE IF NOT EXISTS mine_incident_note (
    mine_incident_note_guid             uuid DEFAULT gen_random_uuid()       PRIMARY KEY,
    mine_incident_guid                  uuid                                    NOT NULL,
    content                             character varying(300)                  NOT NULL,
    deleted_ind                         boolean DEFAULT false                   NOT NULL,
    create_user                         character varying(60)                   NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                         character varying(60)                   NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()  NOT NULL,

    CONSTRAINT mine_incident_guid_fkey FOREIGN KEY (mine_incident_guid) REFERENCES mine_incident(mine_incident_guid)
);

COMMENT ON TABLE mine_incident_note is 'Links notes to mine incidents.';
ALTER TABLE mine_incident_note OWNER TO mds;