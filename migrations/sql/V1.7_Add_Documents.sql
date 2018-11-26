CREATE TABLE public.document_manager (
	document_manager_id serial NOT NULL,
	document_guid uuid NOT NULL DEFAULT gen_random_uuid(),
	full_storage_path varchar(100) NOT NULL,
	uploade_date timestamptz NOT NULL,
	file_display_name varchar(40) NOT NULL,
	path_display_name varchar(100) NOT NULL,
	create_user varchar(60) NOT NULL,
	create_timestamp timestamptz NOT NULL DEFAULT now(),
	update_user varchar(60) NOT NULL,
	update_timestamp timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT document_manager_pk PRIMARY KEY (document_manager_id)
);

-- Permissions

ALTER TABLE public.document_manager OWNER TO mds;
GRANT ALL ON TABLE public.document_manager TO mds;

-- Comment
COMMENT ON TABLE document_manager IS 'documents representations on the file volumes stored in our table structure';
