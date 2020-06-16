ALTER TABLE now_application ADD COLUMN last_updated_by character varying(60);
ALTER TABLE now_application ADD COLUMN IF NOT EXISTS last_updated_date timestamp with time zone DEFAULT NOW() NOT NULL;