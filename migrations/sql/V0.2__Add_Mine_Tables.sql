CREATE TABLE mine_identity (
  mine_guid        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp
);

CREATE TABLE mine_detail (
  mine_detail_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_guid uuid NOT NULL,
  mine_no   character varying(10) NOT NULL,
  mine_name character varying(60) NOT NULL,

  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date     NULL DEFAULT NULL,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
FOREIGN KEY (mine_guid) REFERENCES mine_identity(mine_guid) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mine_identity IS 'Unique entry denoting the existence of a mine in British Columbia.';

COMMENT ON TABLE mine_detail IS 'Core attribution of a mine.';
COMMENT ON COLUMN mine_detail.effective_date IS 'Calendar date upon this attribution is accepted as true (time component implicitly 00:00:00.00).';
COMMENT ON COLUMN mine_detail.expiry_date IS 'Calendar date after which this attribution is accepted as no longer true (time component implicitly 11:59:59.99).';
