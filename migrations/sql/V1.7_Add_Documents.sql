CREATE TABLE public.document_manager (
	document_manager_id serial NOT NULL,
	document_guid uuid NOT NULL DEFAULT gen_random_uuid(),
	full_storage_path varchar NOT NULL,
	uploade_date timestamptz NOT NULL,
	file_display_name varchar NOT NULL,
	path_display_name varchar NOT NULL,
	create_user varchar(60) NOT NULL,
	create_timestamp timestamptz NOT NULL DEFAULT now(),
	update_user varchar(60) NOT NULL,
	update_timestamp timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT document_manager_pk PRIMARY KEY (document_manager_id)
);
