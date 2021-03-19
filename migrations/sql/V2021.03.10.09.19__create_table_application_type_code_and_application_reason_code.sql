CREATE TABLE IF NOT EXISTS public.application_type_code (
	application_type_code VARCHAR(3) NOT NULL,
    description CHARACTER varying(100) NOT NULL,
    active_ind BOOLEAN DEFAULT true NOT null,
	create_user CHARACTER varying(60) NOT NULL,
    create_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
	update_user CHARACTER varying(60) NOT NULL,
	update_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.application_type_code OWNER TO mds;
ALTER TABLE ONLY application_type_code
ADD CONSTRAINT application_type_code_pkey PRIMARY key (application_type_code);

CREATE TABLE IF NOT EXISTS public.amendment_reason_code (
	amendment_reason_code VARCHAR(3) NOT NULL,
    description CHARACTER varying(100) NOT NULL,
    active_ind BOOLEAN DEFAULT true NOT null,
	create_user CHARACTER varying(60) NOT NULL,
    create_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
	update_user CHARACTER varying(60) NOT NULL,
	update_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.amendment_reason_code OWNER TO mds;
ALTER TABLE ONLY amendment_reason_code
ADD CONSTRAINT amendment_reason_code_pkey PRIMARY key (amendment_reason_code);

ALTER TABLE public.now_application_identity ADD source_permit_amendment_id integer NULL;
ALTER TABLE now_application_identity ADD CONSTRAINT source_permit_amendment_id_fk FOREIGN KEY (source_permit_amendment_id) REFERENCES permit_amendment(permit_amendment_id);
