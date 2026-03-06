  -- Fix incorrect is_latest flag for submission 9710 in production environment
UPDATE mine_report_submission
SET is_latest = TRUE
WHERE mine_report_submission_id = 9710
  AND mine_report_submission_guid = '8dc00a33-e2bc-4eea-961c-b9d5853f9cbe'
  AND mine_report_id = 8334;