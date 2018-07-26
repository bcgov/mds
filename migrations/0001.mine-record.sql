DROP TABLE IF EXISTS mine CASCADE;
CREATE TABLE mine (
  mine_guid        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  create_user      character varying(60) NOT NULL DEFAULT 'DUMMY_USER',
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL DEFAULT 'DUMMY_USER',
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp
);

DROP TABLE IF EXISTS mine_core;
CREATE TABLE mine_core (
  mine_guid uuid,
  mine_no   character varying(010) NOT NULL,
  mine_name character varying(100) NOT NULL,
  create_user      character varying(60) NOT NULL DEFAULT 'DUMMY_USER',
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL DEFAULT 'DUMMY_USER',
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
PRIMARY KEY (mine_guid, mine_no),
FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED,
CONSTRAINT mine_no_uk  UNIQUE (mine_no)
);

COMMENT ON TABLE mine IS 'Record of the existence of a BC mine.';
COMMENT ON TABLE mine_core IS 'Core attribution for a BC mine.';

\dt
\d mine
\d mine_core