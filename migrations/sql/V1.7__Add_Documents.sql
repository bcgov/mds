CREATE TABLE public.document_manager (
	document_manager_id serial NOT NULL,
	document_guid uuid NOT NULL,
	full_storage_path varchar(150) NOT NULL,
	upload_date timestamptz NOT NULL,
	file_display_name varchar(40) NOT NULL,
	path_display_name varchar(150) NOT NULL,
	create_user varchar(60) NOT NULL,
	create_timestamp timestamptz NOT NULL DEFAULT now(),
	update_user varchar(60) NOT NULL,
	update_timestamp timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT document_manager_pk PRIMARY KEY (document_manager_id)
);


-- Comment
COMMENT ON TABLE document_manager IS 'documents representations on the file volumes stored in our table structure';
