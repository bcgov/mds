CREATE TABLE IF NOT EXISTS explosives_permit_amendment (
    explosives_permit_amendment_guid uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    explosives_permit_amendment_id serial UNIQUE NOT NULL,
    explosives_permit_guid uuid NOT NULL,    
    mine_manager_mine_party_appt_id integer,
    permittee_mine_party_appt_id integer,
    issuing_inspector_party_guid uuid,
    application_status varchar NOT NULL,
    description varchar,

    permit_number varchar UNIQUE,
    issue_date date,
    expiry_date date,

    application_number varchar UNIQUE,
    application_date date NOT NULL,
    originating_system varchar NOT NULL,
    received_timestamp timestamptz,
    decision_timestamp timestamptz,
    decision_reason varchar,

    latitude numeric(9, 7) NOT NULL,
    longitude numeric(11, 7) NOT NULL,

    is_closed boolean,
    closed_timestamp timestamptz,
    closed_reason varchar,

    deleted_ind boolean DEFAULT false NOT NULL,

    create_user varchar(60) NOT NULL,
    create_timestamp timestamptz DEFAULT now() NOT NULL,
    update_user varchar(60) NOT NULL,
    update_timestamp timestamptz DEFAULT now() NOT NULL,

    FOREIGN KEY (explosives_permit_guid) REFERENCES explosives_permit(explosives_permit_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (mine_manager_mine_party_appt_id) REFERENCES mine_party_appt(mine_party_appt_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (permittee_mine_party_appt_id) REFERENCES mine_party_appt(mine_party_appt_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (issuing_inspector_party_guid) REFERENCES party(party_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (application_status) REFERENCES explosives_permit_status(explosives_permit_status_code) DEFERRABLE INITIALLY DEFERRED
);