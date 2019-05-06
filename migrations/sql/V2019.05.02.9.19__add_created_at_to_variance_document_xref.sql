ALTER TABLE variance_document_xref
ADD COLUMN created_at timestamp with time zone DEFAULT now() NOT NULL;
