-- Clean up existing duplicate is_latest=TRUE records
-- Keep only the most recent submission as latest for each mine_report_id
UPDATE mine_report_submission 
SET is_latest = FALSE 
WHERE mine_report_submission_id NOT IN (
    SELECT MAX(mine_report_submission_id) 
    FROM mine_report_submission 
    WHERE is_latest = TRUE 
    GROUP BY mine_report_id
) 
AND is_latest = TRUE;

-- Create a unique partial index to enforce only one is_latest=TRUE per mine_report_id
-- This prevents race conditions at the database level
CREATE UNIQUE INDEX IF NOT EXISTS idx_mine_report_submission_one_latest 
ON mine_report_submission(mine_report_id) 
WHERE is_latest = TRUE;
