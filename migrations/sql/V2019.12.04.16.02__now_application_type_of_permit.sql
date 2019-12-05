
CREATE TABLE now_application_permit_type(
    now_application_permit_type_code character varying PRIMARY KEY,
    description character varying NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.now_application ADD COLUMN application_permit_type_code varchar REFERENCES now_application_permit_type(now_application_permit_type_code); 
ALTER TABLE public.now_application ADD COLUMN application_permit_term integer;
