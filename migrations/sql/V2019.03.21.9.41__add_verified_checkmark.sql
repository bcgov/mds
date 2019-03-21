CREATE TABLE mine_verified_status (
    mine_verified_status_id SERIAL PRIMARY KEY,
    mine_guid uuid NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    verifying_user character varying(60) NOT NULL,
    verifying_timestamp timestamp with time zone DEFAULT now(),

    CONSTRAINT mine_unique UNIQUE (mine_guid) 
);
ALTER TABLE mine_verified_status OWNER TO mds;
ALTER TABLE mine_verified_status
    ADD CONSTRAINT mine_verified_status_mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED;