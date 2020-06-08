ALTER TABLE now_application ADD COLUMN last_updated_date timestamp with time zone DEFAULT null;
ALTER TABLE now_application ADD COLUMN last_updated_by character varying(60);
