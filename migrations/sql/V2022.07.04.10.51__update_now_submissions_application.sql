ALTER TABLE IF EXISTS now_submissions.application
ADD COLUMN IF NOT EXISTS gatelatitude numeric(9, 7),
ADD COLUMN IF NOT EXISTS gatelongitude numeric(11, 7);