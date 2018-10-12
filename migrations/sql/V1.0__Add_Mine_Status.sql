CREATE TABLE mine_operation_status_code (
  mine_operation_status_code character varying(3) PRIMARY KEY NOT NULL,
  description character varying(100) NOT NULL,
  display_order smallint,
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
CONSTRAINT display_order_max_length check (display_order < 1000)
);

CREATE TABLE mine_operation_status_reason_code (
  mine_operation_status_reason_code character varying(3) PRIMARY KEY NOT NULL,
  description character varying(100) NOT NULL,
  display_order smallint,
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
CONSTRAINT display_order_max_length check (display_order < 1000)
);

CREATE TABLE mine_operation_status_sub_reason_code (
  mine_operation_status_sub_reason_code character varying(3) PRIMARY KEY NOT NULL,
  description character varying(100) NOT NULL,
  display_order smallint,
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
CONSTRAINT display_order_max_length check (display_order < 1000)
);

CREATE TABLE mine_status_xref (
  mine_status_xref_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_operation_status_code character varying(3) NOT NULL,
  mine_operation_status_reason_code character varying(3),
  mine_operation_status_sub_reason_code character varying(3),
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
FOREIGN KEY (mine_operation_status_code) REFERENCES mine_operation_status_code(mine_operation_status_code) DEFERRABLE INITIALLY DEFERRED,
FOREIGN KEY (mine_operation_status_reason_code) REFERENCES mine_operation_status_reason_code(mine_operation_status_reason_code) DEFERRABLE INITIALLY DEFERRED,
FOREIGN KEY (mine_operation_status_sub_reason_code) REFERENCES mine_operation_status_sub_reason_code(mine_operation_status_sub_reason_code) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE mine_status (
  mine_status_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_guid uuid NOT NULL,
  mine_status_xref_guid uuid NOT NULL,
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
FOREIGN KEY (mine_guid) REFERENCES mine_identity(mine_guid) DEFERRABLE INITIALLY DEFERRED,
FOREIGN KEY (mine_status_xref_guid) REFERENCES mine_status_xref(mine_status_xref_guid) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mine_status IS 'This mine_status table contains a specific mine''s operational status over time.';
COMMENT ON TABLE mine_status_xref IS 'This mine_status_xref table contains a lookup of all valid operational states a mine could be in at a given time. This table is maintained by the business as it contains a hierarchy of valid statuses and reasons.';
COMMENT ON TABLE mine_operation_status_code IS 'This mine_operation_status_code table is the top level in the hierarchy of classifying a mine.';
COMMENT ON TABLE mine_operation_status_reason_code IS 'This mine_operation_status_reason_code table is the second level in the hierarchy of classifying a mine and is one level below mine_operation_status_code.';
COMMENT ON TABLE mine_operation_status_sub_reason_code IS 'This mine_operation_status_sub_reason_code table is the third level in the hierarchy of classifying a mine and is one level below mine_operation_status_reason_code.';
