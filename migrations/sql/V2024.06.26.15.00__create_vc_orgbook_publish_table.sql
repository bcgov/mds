CREATE TABLE IF NOT EXISTS permit_amendment_orgbook_publish_status (
    unsigned_payload_hash varchar(255) PRIMARY KEY,
    permit_amendment_guid uuid NOT NULL,
    party_guid uuid NOT NULL,
    sign_date timestamp with time zone,
    signed_credential text,
    publish_state bool,
    orgbook_credential_id varchar(255),
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);