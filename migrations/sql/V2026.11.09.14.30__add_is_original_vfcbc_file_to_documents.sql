ALTER TABLE mine_document
    ADD COLUMN IF NOT EXISTS "is_original_vfcbc_file" boolean NOT NULL DEFAULT false;

ALTER TABLE now_submissions.document
    ADD COLUMN IF NOT EXISTS "is_original_vfcbc_file" boolean NOT NULL DEFAULT false;

ALTER TABLE mine_document_version
    ADD COLUMN IF NOT EXISTS "is_original_vfcbc_file" boolean NOT NULL DEFAULT false;
