ALTER TABLE now_application ADD COLUMN imported_by character varying(60);
ALTER TABLE now_application ADD COLUMN imported_date timestamp with time zone;