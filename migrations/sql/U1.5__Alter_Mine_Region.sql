CREATE TABLE mine_region( 
    mine_region_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_guid uuid NOT NULL,
    region_code character varying(2) NOT NULL,
    create_user      character varying(60) NOT NULL,
    create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
    update_user      character varying(60) NOT NULL,
    update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
FOREIGN KEY(mine_guid) REFERENCES mine_identity(mine_guid) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
FOREIGN KEY(region_code) REFERENCES mine_region_code(region_code) ON DELETE CASCADE
);

ALTER TABLE mine_region_code RENAME mine_region_code TO region_code;

ALTER TABLE mine_detail DROP COLUMN mine_region;