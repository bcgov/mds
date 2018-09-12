CREATE TABLE  person_contact(
  person_contact_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_guid uuid NOT NULL,
  mine_manager_guid uuid NOT NULL,
  phone_number character varying(11) NOT NULL,
  email character varying(100) NOT NULL,
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
FOREIGN KEY (person_guid) REFERENCES person(person_guid) DEFERRABLE INITIALLY DEFERRED
FOREIGN KEY (mine_manager_guid)   REFERENCES mine_identity(mine_guid) DEFERRABLE INITIALLY DEFERRED,
);