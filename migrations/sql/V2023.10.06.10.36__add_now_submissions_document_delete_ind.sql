ALTER TABLE
    now_submissions.document
ADD
    COLUMN IF NOT EXISTS deleted_ind boolean DEFAULT false NOT NULL;