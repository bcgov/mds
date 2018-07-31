CREATE TABLE mine_identifier (
  mine_guid        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  create_user      character varying(60) NOT NULL DEFAULT 'DUMMY_USER',
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL DEFAULT 'DUMMY_USER',
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp
);

CREATE TABLE mine_details (
  mine_guid uuid,
  mine_no   character varying(010) NOT NULL,
  mine_name character varying(100) NOT NULL,
  create_user      character varying(60) NOT NULL DEFAULT 'DUMMY_USER',
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL DEFAULT 'DUMMY_USER',
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
PRIMARY KEY (mine_guid, mine_no),
FOREIGN KEY (mine_guid) REFERENCES mine_identifier(mine_guid) DEFERRABLE INITIALLY DEFERRED,
CONSTRAINT mine_no_uk  UNIQUE (mine_no)
);

COMMENT ON TABLE mine_identifier IS 'Record of the existence of a BC mine.';
COMMENT ON TABLE mine_details IS 'Core attribution for a BC mine.';