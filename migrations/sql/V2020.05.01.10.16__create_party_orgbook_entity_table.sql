CREATE TABLE IF NOT EXISTS party_orgbook_entity
(
    party_orgbook_entity_id                                            SERIAL PRIMARY KEY,
    registration_id                     varchar                           UNIQUE NOT NULL,
    registration_status                 boolean                                  NOT NULL,
    registration_date                   timestamp                                NOT NULL,
    name_id                             integer                           UNIQUE NOT NULL,
    name_text                           varchar                           UNIQUE NOT NULL,
    credential_id                       integer                           UNIQUE NOT NULL,
    
    party_guid                          uuid                              UNIQUE NOT NULL,
    association_user                    character varying(60)                    NOT NULL,
    association_timestamp               timestamp with time zone DEFAULT now()   NOT NULL,

    create_user                         character varying(60)                    NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                         character varying(60)                    NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,

    FOREIGN KEY (party_guid) REFERENCES party(party_guid)
);

ALTER TABLE party_orgbook_entity OWNER TO mds;

COMMENT ON TABLE party_orgbook_entity IS 'Contains information on parties that have an associated OrgBook entity.';