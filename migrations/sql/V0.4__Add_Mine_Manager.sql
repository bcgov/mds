/* Placeholder table to hold 'Person of interest to the Ministry' */
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

/*
   Placeholder table to hold 'Mine Manager Appointments over time'; may be expanded to hold
   any type of relationship (e.g. Contact, Permittee, etc.) between a Mine and a Party
   (i.e. "A person or organization of interest to the Ministry")
*/
CREATE TABLE mgr_appointment (
  mgr_appointment_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_guid uuid NOT NULL,
  person_guid uuid NOT NULL,
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
FOREIGN KEY (mine_guid)   REFERENCES mine_identity(mine_guid) DEFERRABLE INITIALLY DEFERRED,
FOREIGN KEY (person_guid) REFERENCES person(person_guid)      DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE person IS 'A person of interest to the Ministry.';