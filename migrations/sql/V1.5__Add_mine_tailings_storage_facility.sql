CREATE TABLE mine_tailings_storage_facility (
  mine_tailings_storage_facility_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_tailings_storage_facility_name character varying(60) NOT NULL,
  mine_guid uuid NOT NULL,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,

  FOREIGN KEY (mine_guid) REFERENCES mine_identity(mine_guid) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mine_tailings_storage_facility IS 'Stores the information relavent to a mine tailings storage facility.';
