-- Drop legacy tables, columns, and constraints
ALTER TABLE project_summary
DROP CONSTRAINT IF EXISTS mine_guid_fkey,
DROP COLUMN IF EXISTS mine_guid,
DROP CONSTRAINT IF EXISTS project_summary_lead_party_guid_fkey,
DROP COLUMN IF EXISTS project_summary_lead_party_guid,
DROP COLUMN IF EXISTS project_summary_title,
DROP COLUMN IF EXISTS proponent_project_id;
