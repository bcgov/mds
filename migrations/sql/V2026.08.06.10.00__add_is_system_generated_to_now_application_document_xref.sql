ALTER TABLE now_application_document_xref
    ADD COLUMN IF NOT EXISTS is_system_generated boolean NOT NULL DEFAULT false;
