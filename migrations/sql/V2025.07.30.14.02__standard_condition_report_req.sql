-- Add is_standard column with default false to mine_report_req_permit_condition_xref
ALTER TABLE mine_report_req_permit_condition_xref
    ADD COLUMN is_standard BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE mine_report_req_permit_condition_xref
    ADD COLUMN standard_permit_condition_id INTEGER NULL REFERENCES standard_permit_conditions(standard_permit_condition_id);

-- same additions for version table
ALTER TABLE mine_report_req_permit_condition_xref_version
    ADD COLUMN is_standard BOOLEAN DEFAULT FALSE;
ALTER TABLE mine_report_req_permit_condition_xref_version
    ADD COLUMN standard_permit_condition_id INTEGER;

-- Drop NOT NULL constraint on permit_condition_ids
ALTER TABLE mine_report_req_permit_condition_xref
    ALTER COLUMN permit_condition_id DROP NOT NULL;

-- Add a check constraint: at least one of permit_condition_id or standard_permit_condition_id must be present
ALTER TABLE mine_report_req_permit_condition_xref
    ADD CONSTRAINT mine_report_req_permit_condition_xref_condition_required
    CHECK (
        (is_standard = FALSE AND permit_condition_id IS NOT NULL)
        OR (is_standard = TRUE AND  standard_permit_condition_id IS NOT NULL)
    );

-- Add is_standard column with default false
ALTER TABLE mine_report_permit_requirement
    ADD COLUMN is_standard BOOLEAN NOT NULL DEFAULT FALSE;

-- Drop NOT NULL constraint on permit_amendment_id
ALTER TABLE mine_report_permit_requirement
    ALTER COLUMN permit_amendment_id DROP NOT NULL;

-- Add a check constraint: permit_amendment_id must be NOT NULL if is_standard is false
ALTER TABLE mine_report_permit_requirement
    ADD CONSTRAINT mine_report_permit_requirement_amendment_required_if_not_standard
    CHECK (
        (is_standard = TRUE AND permit_amendment_id IS NULL)
        OR (is_standard = FALSE AND permit_amendment_id IS NOT NULL)
    );

ALTER TABLE mine_report_permit_requirement_version
    ADD COLUMN is_standard BOOLEAN NOT NULL DEFAULT FALSE;

-- add unique index for standard report requirements: report_name must be unique where is_standard = True
CREATE UNIQUE INDEX unique_standard_report_name_idx
ON mine_report_permit_requirement (report_name)
WHERE is_standard = TRUE AND report_name IS NOT NULL;