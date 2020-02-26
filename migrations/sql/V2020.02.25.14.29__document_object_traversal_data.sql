
ALTER TABLE document_template ADD COLUMN source_object varchar NOT NULL DEFAULT 'NOWApplicationIdentity'; 
ALTER TABLE document_template ALTER COLUMN source_object DROP NOT NULL; 
