
CREATE TABLE party_verifiable_credential_mines_act_permit
(
    cred_exch_id uuid PRIMARY KEY,
    party_guid uuid NOT NULL,
    permit_amendment_guid uuid NOT NULL,
    cred_exch_state character varying(30),
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    
    FOREIGN KEY (party_guid) REFERENCES party(party_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (permit_amendment_guid) REFERENCES permit_amendment(permit_amendment_guid) DEFERRABLE INITIALLY DEFERRED
);
