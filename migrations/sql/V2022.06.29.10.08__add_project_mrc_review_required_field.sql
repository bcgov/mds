ALTER TABLE IF EXISTS project ADD COLUMN IF NOT EXISTS mrc_review_required BOOLEAN DEFAULT false NOT NULL;