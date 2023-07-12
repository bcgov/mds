CREATE TABLE IF NOT EXISTS mine_document_version(
    mine_document_version_guid uuid DEFAULT gen_random_uuid() NOT NULL,
	mine_document_guid uuid NOT NULL,
	document_manager_version_guid uuid NOT NULL,
	upload_date timestamp with time zone DEFAULT now() NOT NULL,
    document_name character varying(255) NOT NULL,
	create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
	deleted_ind boolean DEFAULT false NOT NULL,
  	FOREIGN KEY (mine_document_guid) REFERENCES mine_document(mine_document_guid)
);

ALTER TABLE mine_document OWNER TO mds;
