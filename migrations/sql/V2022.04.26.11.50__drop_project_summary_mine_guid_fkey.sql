-- The project summary factories have been updated in the code base to not include mine_guid anymore but the schema still has a NOT NULL FKEY. 
-- We need to disable this to move forward.
ALTER TABLE project_summary DROP CONSTRAINT IF EXISTS mine_guid_fkey;