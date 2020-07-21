CREATE TABLE IF NOT EXISTS permit_conditions
(
    permit_condition_id                                                SERIAL PRIMARY KEY,
    permit_amendment_id                 varchar                           UNIQUE NOT NULL,
    condition                           varchar                                  NOT NULL,
    condition_type                      varchar                                  NOT NULL,

    create_user                         character varying(60)                    NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                         character varying(60)                    NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,

    FOREIGN KEY (party_guid) REFERENCES party(party_guid)
);

ALTER TABLE party_orgbook_entity OWNER TO mds;

COMMENT ON TABLE party_orgbook_entity IS 'Contains information on parties that have an associated OrgBook entity.';