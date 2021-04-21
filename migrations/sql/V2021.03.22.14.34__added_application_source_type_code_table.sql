CREATE TABLE IF NOT EXISTS public.application_source_type_code (
	application_source_type_code VARCHAR(3) NOT NULL,
    description CHARACTER varying(100) NOT NULL,
    active_ind BOOLEAN DEFAULT true NOT null,
	create_user CHARACTER varying(60) NOT NULL,
    create_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
	update_user CHARACTER varying(60) NOT NULL,
	update_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);


ALTER TABLE public.application_source_type_code OWNER TO mds;
ALTER TABLE ONLY application_source_type_code
ADD CONSTRAINT application_source_type_code_pkey PRIMARY key (application_source_type_code);


ALTER TABLE now_application ADD COLUMN application_source_type_code varchar(3);
ALTER TABLE now_application ADD CONSTRAINT application_source_type_code_fk FOREIGN KEY (application_source_type_code) REFERENCES application_source_type_code(application_source_type_code);