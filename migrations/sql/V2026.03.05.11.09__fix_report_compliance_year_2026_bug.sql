-- Fix existing reports that have the incorrect compliance year
-- Change compliance year to 2025 for reports due in Jan-Mar of 2026

UPDATE mine_report
SET submission_year = 2025
WHERE submission_year = 2026 
  AND EXTRACT(MONTH FROM due_date) <= 3
  AND EXTRACT(YEAR FROM due_date) = 2026;
