ALTER TABLE surface_bulk_sample DROP COLUMN IF EXISTS spontaneous_combustion_handling;
ALTER TABLE now_submissions.application DROP COLUMN IF EXISTS spontaneouscombustionhandling;

ALTER TABLE now_submissions.application ADD COLUMN IF NOT EXISTS hasarchaeologicalprotectionplan varchar;

ALTER TABLE now_submissions.application DROP COLUMN IF EXISTS isonprivateland;
