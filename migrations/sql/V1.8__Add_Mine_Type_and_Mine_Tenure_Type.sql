CREATE TABLE mine_tenure_type (
  mine_tenure_type_id   smallint PRIMARY KEY NOT NULL,
  mine_tenure_type_name character varying(30) NOT NULL,

  --Audit Columns
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp
);

COMMENT ON TABLE mine_tenure_type IS 'A valid mine tenure type value to be referenced by mine_type.';

CREATE TABLE mine_type (
  mine_type_guid        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_guid             uuid NOT NULL,
  mine_tenure_type_id   smallint,

  --Audit Columns
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,

  --Foreign Key Definitions
  FOREIGN KEY (mine_tenure_type_id) REFERENCES mine_tenure_type(mine_tenure_type_id) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mine_type IS 'The intersection of a mine_tenure_type with other mine information, such as commodity type and/or disturbance type';

ALTER TABLE mine_detail
  ADD mine_type_guid uuid,
  ADD FOREIGN KEY (mine_type_guid) REFERENCES mine_type(mine_type_guid) DEFERRABLE INITIALLY DEFERRED
;
