ALTER TABLE now_submissions.application ADD COLUMN IF NOT EXISTS 
    hasacknowledgedundrip varchar;

ALTER TABLE state_of_land ADD COLUMN IF NOT EXISTS
    has_acknowledged_undrip boolean;