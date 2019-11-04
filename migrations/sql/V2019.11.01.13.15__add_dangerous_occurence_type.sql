CREATE TABLE mine_incident_category (
    mine_incident_category character varying PRIMARY KEY,
    description character varying NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE mine_incident_category OWNER TO mds;

alter table mine_incident add column mine_incident_category character varying REFERENCES mine_incident_category(mine_incident_category);
