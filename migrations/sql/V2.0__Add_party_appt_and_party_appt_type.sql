CREATE TABLE public.mine_party_appt_type_code (
    mine_party_appt_type_code varchar(3) NOT NULL,
    description varchar(100) NOT NULL,
    display_order int4 NULL,
    active_ind bool NOT NULL,
    create_user varchar(60) NOT NULL,
    create_timestamp timestamptz NOT NULL DEFAULT now(),
    update_user varchar(60) NOT NULL,
    update_timestamp timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT party_mine_xref_type_code_pk PRIMARY KEY (mine_party_appt_type_code)
);

CREATE TABLE public.mine_party_appt (
    mine_party_appt_id serial NOT NULL,
    mine_guid uuid NOT NULL,
    party_guid uuid NOT NULL,
    mine_party_appt_type_code varchar(3) NOT NULL,
    effective_date date NOT NULL DEFAULT now(),
    expriy_date date NOT NULL DEFAULT '9999-12-31'::date,
    create_user varchar(60) NOT NULL,
    create_timestamp timestamptz NOT NULL DEFAULT now(),
    update_user varchar(60) NOT NULL,
    update_timestamp timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT party_mine_xref_pk PRIMARY KEY (mine_party_appt_id),
    CONSTRAINT party_mine_xref_mine_identity_fkey FOREIGN KEY (mine_guid) REFERENCES mine_identity(mine_guid),
    CONSTRAINT party_mine_xref_party_fk FOREIGN KEY (party_guid) REFERENCES party(party_guid),
    CONSTRAINT party_mine_xref_party_mine_xref_type_code_fk FOREIGN KEY (mine_party_appt_type_code) REFERENCES mine_party_appt_type_code(mine_party_appt_type_code)
);
