

ALTER TABLE now_submissions.application DROP COLUMN sandgrvqrymaxunreclaimed;
ALTER TABLE now_submissions.application ADD COLUMN IF NOT EXISTS sandgrvqrymaxunreclaimed numeric;

