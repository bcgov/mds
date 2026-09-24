ALTER TABLE now_application_document_identity_xref
    ADD COLUMN IF NOT EXISTS permit_package_document_type_code character varying(20);

ALTER TABLE now_application_document_identity_xref
ADD CONSTRAINT now_application_document_identity_xref_permit_package_doc_fkey
    FOREIGN KEY (permit_package_document_type_code)
    REFERENCES permit_package_document_type(permit_package_document_type_code);
