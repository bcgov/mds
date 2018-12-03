CREATE TABLE public.mine_party_appt_type_code (
    mine_party_appt_type_code varchar(3) NOT NULL,
    description varchar(100) NOT NULL,
    display_order int4 NULL,
    active_ind bool NOT NULL DEFAULT 'yes',
    create_user varchar(60) NOT NULL,
    create_timestamp timestamptz NOT NULL DEFAULT now(),
    update_user varchar(60) NOT NULL,
    update_timestamp timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT party_mine_xref_type_code_pk PRIMARY KEY (mine_party_appt_type_code)
);

CREATE TABLE public.mine_party_appt (
	mine_party_appt_id serial NOT NULL,
	mine_party_appt_guid uuid NOT NULL DEFAULT gen_random_uuid(),
	mine_guid uuid NOT NULL,
	party_guid uuid NOT NULL,
	mine_party_appt_type_code varchar(3) NOT NULL,
	effective_date date NOT NULL DEFAULT now(),
	expriy_date date NOT NULL DEFAULT '9999-12-31'::date,
	create_user varchar(60) NOT NULL,
	create_timestamp timestamptz NOT NULL DEFAULT now(),
	update_user varchar(60) NOT NULL,
	update_timestamp timestamptz NOT NULL DEFAULT now(),
	mine_tailings_storage_facility_guid uuid NULL,
	permit_guid uuid NULL,
	CONSTRAINT mine_party_appt_pk PRIMARY KEY (mine_party_appt_id),
	CONSTRAINT mine_party_appt_mine_tailings_storage_facility_fk FOREIGN KEY (mine_tailings_storage_facility_guid) REFERENCES mine_tailings_storage_facility(mine_tailings_storage_facility_guid),
	CONSTRAINT mine_party_appt_permit_fk FOREIGN KEY (permit_guid) REFERENCES permit(permit_guid),
	CONSTRAINT mine_party_appt_mine_identity_fkey FOREIGN KEY (mine_guid) REFERENCES mine_identity(mine_guid),
	CONSTRAINT mine_party_appt_party_fk FOREIGN KEY (party_guid) REFERENCES party(party_guid),
	CONSTRAINT mine_party_appt_mine_party_appt_type_code_fk FOREIGN KEY (mine_party_appt_type_code) REFERENCES mine_party_appt_type_code(mine_party_appt_type_code)
);

CREATE INDEX mine_party_appt_guid_idx ON mine_party_appt(mine_party_appt_guid);