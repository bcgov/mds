ALTER TABLE now_application_document_xref ADD COLUMN IF NOT EXISTS final_package_order integer;
ALTER TABLE now_application_document_identity_xref ADD COLUMN IF NOT EXISTS final_package_order integer;