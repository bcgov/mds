CREATE TABLE party_type_code (
  party_type_code character varying(3) PRIMARY KEY NOT NULL,
  description character varying(100) NOT NULL,
  display_order integer,
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
CONSTRAINT display_order_max_length check (display_order < 1000)
);

ALTER TABLE person RENAME TO party;
ALTER TABLE party
  ADD middle_name character varying(100),
  ADD party_type_code character varying(3) NOT NULL,
  ALTER COLUMN first_name DROP NOT NULL,
  ADD FOREIGN KEY(party_type_code) REFERENCES party_type_code(party_type_code)
;
-- Note that renaming columns were not able to be placed into a single statment.
ALTER TABLE party RENAME COLUMN person_guid TO party_guid;
ALTER TABLE party RENAME COLUMN surname TO party_name;
ALTER TABLE mgr_appointment RENAME COLUMN person_guid to party_guid;

CREATE TABLE permittee (
  permittee_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_guid uuid NOT NULL,
  party_guid uuid NOT NULL,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
FOREIGN KEY (permit_guid) REFERENCES permit(permit_guid) DEFERRABLE INITIALLY DEFERRED,
FOREIGN KEY (party_guid) REFERENCES party(party_guid) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE party IS 'Column party_name refers to either a surname for a person or the company name';