ALTER TABLE now_submissions.mech_trenching_activity ADD COLUMN IF NOT EXISTS length numeric;
ALTER TABLE now_submissions.mech_trenching_activity ADD COLUMN IF NOT EXISTS depth numeric;
ALTER TABLE now_submissions.mech_trenching_activity ADD COLUMN IF NOT EXISTS width numeric;