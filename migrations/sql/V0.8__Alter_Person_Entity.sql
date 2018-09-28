/*
Altering Person table from:
CREATE TABLE person (
  person_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name character varying(100) NOT NULL,
  surname    character varying(100) NOT NULL,
  phone_no character varying(12) NOT NULL,
  phone_ext character varying(4),
  email character varying(254) NOT NULL,
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp
);
TO:
CREATE TABLE party (
  party_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name character varying(100),
  surname    character varying(100),
  company_name character varying(100),
  party_type character varying(3),
  phone_no character varying(12) NOT NULL,
  phone_ext character varying(4),
  email character varying(254) NOT NULL,
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp
FOREIGN KEY (party_type) REFERENCES party_type_code(party_type_code) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE party_type_code (
    party_type_code character varying(3) PRIMARY KEY NOT NULL,
    party_type_code_guid uuid DEFAULT gen_random_uuid(),
    party_type_description character varying(100) NOT NULL,
    display_order integer,
    effective_date date NOT NULL DEFAULT now(),
    expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
    create_user      character varying(60) NOT NULL,
    create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
    update_user      character varying(60) NOT NULL,
    update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp
)

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

*/
CREATE TABLE party_type_code (
    party_type_code character varying(3) PRIMARY KEY NOT NULL,
    party_type_code_guid uuid DEFAULT gen_random_uuid(),
    party_type_description character varying(100) NOT NULL,
    display_order integer,
    effective_date date NOT NULL DEFAULT now(),
    expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
    create_user      character varying(60) NOT NULL,
    create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
    update_user      character varying(60) NOT NULL,
    update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp
)

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

ALTER TABLE mine_mgr_appointment DROP FOREIGN KEY person_guid;

ALTER TABLE person RENAME TO party;
ALTER TABLE party (
    ADD middle_name character varying(100), party_type character varying(3) NOT NULL,
    ALTER COLUMN surname TO party_name(100),
    ALTER COLUMN first_name DROP NOT NULL,
    ALTER COLUMN surname DROP NOT NULL,
    ADD FOREIGN KEY(party_type) REFERENCES party_type_code(party_type_code),
    CHANGE person_guid TO party_guid uuid DEFAULT gen_random_uuid()
);

ALTER TABLE mine_mgr_appointment CHANGE person_guid TO party_guid uuid;
ALTER TABLE mine_mgr_appointment ADD FOREIGN KEY(party_guid) REFERENCES party(party_guid) DEFERRABLE INITIALLY DEFERRED;