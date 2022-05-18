CREATE TYPE nod_document_type AS ENUM ('checklist', 'other');

ALTER TABLE notice_of_departure_document_xref DROP IF EXISTS document_description;
ALTER TABLE notice_of_departure_document_xref ADD IF NOT EXISTS document_type nod_document_type NOT NULL DEFAULT 'other';