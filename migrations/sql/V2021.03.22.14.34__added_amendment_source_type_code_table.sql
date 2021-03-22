CREATE TABLE IF NOT EXISTS public.amendment_source_type_code (
	amendment_source_type_code VARCHAR(3) NOT NULL,
    description CHARACTER varying(100) NOT NULL,
    active_ind BOOLEAN DEFAULT true NOT null,
	create_user CHARACTER varying(60) NOT NULL,
    create_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
	update_user CHARACTER varying(60) NOT NULL,
	update_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);


ALTER TABLE public.amendment_source_type_code OWNER TO mds;
ALTER TABLE ONLY amendment_source_type_code
ADD CONSTRAINT amendment_source_type_code_pkey PRIMARY key (amendment_source_type_code);