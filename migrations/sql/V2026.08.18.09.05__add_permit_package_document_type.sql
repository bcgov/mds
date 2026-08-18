CREATE TABLE permit_package_document_type (
    permit_package_document_type_code character varying(20)                  NOT NULL PRIMARY KEY,
    description                       character varying(100)                 NOT NULL            ,
    active_ind                        boolean                  DEFAULT true  NOT NULL            ,
    create_user                       character varying(60)                  NOT NULL            ,
    create_timestamp                  timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                       character varying(60)                  NOT NULL            ,
    update_timestamp                  timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE permit_package_document_type OWNER TO mds;

COMMENT ON TABLE permit_package_document_type IS 'The valid options for classifying a Notice of Work permit package document as a figure or a document.';

ALTER TABLE now_application_document_xref
    ADD COLUMN IF NOT EXISTS permit_package_document_type_code character varying(20);

ALTER TABLE now_application_document_xref
ADD CONSTRAINT now_application_document_xref_permit_package_document_type_fkey
    FOREIGN KEY (permit_package_document_type_code)
    REFERENCES permit_package_document_type(permit_package_document_type_code);
