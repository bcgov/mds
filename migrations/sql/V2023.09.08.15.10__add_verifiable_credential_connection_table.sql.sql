
CREATE TABLE mine_verifiable_credential_connection
(
    invitation_id uuid PRIMARY KEY,
    mine_guid uuid NOT NULL,
    connection_id uuid NOT NULL,
    connection_state character varying(30),
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    
    FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid)
    DEFERRABLE INITIALLY DEFERRED
);
