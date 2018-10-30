CREATE TABLE mine_location (
  mine_location_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_guid uuid NOT NULL,
  latitude   numeric(9,7) NOT NULL,
  longitude   numeric(11,7) NOT NULL,
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
FOREIGN KEY (mine_guid) REFERENCES mine_identity(mine_guid) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX mine_location_lat_long_idx ON mine_location (latitude, longitude);

COMMENT ON TABLE mine_location IS 'FCBC staging tables hold up to NUMBER(9,7) for Latitude and NUMBER(11,7) for Longitude.';