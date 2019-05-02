ALTER TABLE variance_document_xref
ADD COLUMN uploaded_at timestamp with time zone DEFAULT now() NOT NULL;
