-- The project summary factories have been updated in the code base to not include mine_guid anymore but the schema still has a NOT NULL FKEY. 
-- We need to disable this and change the column to NULLABLE to move forward.
ALTER TABLE project_summary
  ALTER COLUMN mine_guid DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS mine_guid_fkey,
  ALTER COLUMN project_summary_title DROP NOT NULL;