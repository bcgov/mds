CREATE TABLE permit_status_code (
  permit_status_code character varying(2) PRIMARY KEY NOT NULL,
  permit_status_code_guid uuid DEFAULT gen_random_uuid(),
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

CREATE TABLE permit (
  permit_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_guid uuid NOT NULL,
  permit_no character varying(12) NOT NULL,
  received_date date NOT NULL DEFAULT '9999-12-31'::date,
  approved_date    date NOT NULL DEFAULT '9999-12-31'::date,
  permit_status_code character varying(2) NOT NULL,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
FOREIGN KEY (mine_guid) REFERENCES mine_identity(mine_guid) DEFERRABLE INITIALLY DEFERRED,
FOREIGN KEY (permit_status_code) REFERENCES permit_status_code(permit_status_code) DEFERRABLE INITIALLY DEFERRED
);