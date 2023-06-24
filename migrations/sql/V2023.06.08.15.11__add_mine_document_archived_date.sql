ALTER TABLE mine_document
	ADD COLUMN IF NOT EXISTS "is_archived" boolean NOT NULL DEFAULT false,
	ADD COLUMN IF NOT EXISTS "archived_by" varchar(60),
	ADD COLUMN IF NOT EXISTS "archived_date" timestamp;
