CREATE TABLE IF NOT EXISTS application_document_type (
    application_document_type_code   varchar(3) PRIMARY KEY,
    description                      varchar(50),
    active_ind                       boolean DEFAULT true NOT NULL,
    create_user                      character varying(60) NOT NULL,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL,
    update_user                      character varying(60) NOT NULL,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE application_document_type OWNER TO mds;

COMMENT ON TABLE application_document_type IS 'Definition of the type of application document (eg. Case File, Spatial File)';

CREATE TABLE IF NOT EXISTS application_document_xref
(
    application_document_xref uuid    DEFAULT gen_random_uuid() NOT NULL,
    mine_document_guid                uuid NOT NULL REFERENCES mine_document(mine_document_guid),
	application_document_type_code    varchar(3) REFERENCES application_document_type(application_document_type_code),
    permit_application_id                 	  integer NOT NULL REFERENCES permit_application(permit_application_id)
);

ALTER TABLE application_document_xref OWNER TO mds;

COMMENT ON TABLE application_document_xref IS 'Documents relating to a NoW application.';