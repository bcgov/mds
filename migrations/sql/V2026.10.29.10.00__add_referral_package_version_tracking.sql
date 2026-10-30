ALTER TABLE now_application_referral_package_document_xref
    ADD COLUMN IF NOT EXISTS file_create_timestamp TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN now_application_referral_package_document_xref.file_create_timestamp IS 'When the snapshotted file was uploaded. mine_document_version copies this value when the file is replaced, which identifies the archived version.';

CREATE UNIQUE INDEX IF NOT EXISTS now_app_ref_pkg_app_id_order_uidx
    ON now_application_referral_package (now_application_id, package_order);
