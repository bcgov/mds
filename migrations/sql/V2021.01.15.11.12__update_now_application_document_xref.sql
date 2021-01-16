ALTER TABLE now_application_document_xref ADD PRIMARY KEY (now_application_document_xref_guid);

ALTER TABLE now_application_document_xref
ADD COLUMN IF NOT EXISTS preamble_title varchar,
ADD COLUMN IF NOT EXISTS preamble_author varchar,
ADD COLUMN IF NOT EXISTS preamble_date timestamptz;

ALTER TABLE now_application_document_identity_xref
ADD COLUMN IF NOT EXISTS preamble_title varchar,
ADD COLUMN IF NOT EXISTS preamble_author varchar,
ADD COLUMN IF NOT EXISTS preamble_date timestamptz;
