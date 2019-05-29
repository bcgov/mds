CREATE TABLE party_business_role_code (
    party_business_role_code         character varying(32)                  NOT NULL PRIMARY KEY,
    description                      character varying(100)                 NOT NULL            ,
    active_ind                       boolean DEFAULT true                   NOT NULL            ,
    create_user                      character varying(60)                  NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      character varying(60)                  NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE party_business_role_code OWNER TO mds;

COMMENT ON TABLE party_business_role_code IS 'Business roles that a party belongs to.';

CREATE TABLE IF NOT EXISTS party_business_role_appt
(
    party_business_role_id      serial                                  NOT NULL PRIMARY KEY,
    party_guid                  uuid                                    NOT NULL            ,
    party_business_role_code    character varying(32)                   NOT NULL            ,
    started_at                  timestamptz                             NOT NULL            ,
    ended_at                    timestamptz,
    active_ind                  boolean DEFAULT true                    NOT NULL            ,
    create_user                 character varying(60)                   NOT NULL            ,
    create_timestamp            timestamp with time zone DEFAULT now()  NOT NULL            ,
    update_user                 character varying(60)                   NOT NULL            ,
    update_timestamp            timestamp with time zone DEFAULT now()  NOT NULL
);

COMMENT ON TABLE party_business_role_appt is 'Assignment of business roles to parties.'

ALTER TABLE ONLY party_business_role_appt
    ADD CONSTRAINT party_business_role_appt_party_guid_fkey FOREIGN KEY (party_guid) REFERENCES party(party_guid);
ALTER TABLE ONLY party_business_role_appt
    ADD CONSTRAINT party_business_role_appt_party_business_role_code_fkey FOREIGN KEY (party_business_role_code) REFERENCES party_business_role_code(party_business_role_code);

INSERT INTO party_business_role_code (party_business_role_code, description, create_user, update_user) VALUES ('INS', 'Inspector', 'system-mds', 'system-mds');