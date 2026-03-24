-- Disable Report of MERP Test
UPDATE mine_report_definition SET active_ind = FALSE WHERE mine_report_definition_id = 3;
-- Disable alternate Performance of High Risk Dumps
UPDATE mine_report_definition SET active_ind = FALSE WHERE mine_report_definition_id = 29;
-- Disable TSF, WSF or Dam As-built Report
UPDATE mine_report_definition SET active_ind = FALSE WHERE mine_report_definition_id = 32;
-- Disable First Nations Engagement (supplied)
UPDATE mine_report_definition SET active_ind = FALSE WHERE mine_report_definition_id = 671;
-- Disable Annual Reclamation and Environmental Monitoring Work Report
UPDATE mine_report_definition SET active_ind = FALSE WHERE mine_report_definition_id = 679;
-- Disable Annual Dam Safety Inspection
UPDATE mine_report_definition SET active_ind = FALSE WHERE mine_report_definition_id = 680;


-- Set 5-year Mine Plan to PMT
UPDATE mine_report_definition SET mine_report_due_date_type = 'PMT' WHERE report_name = '5-year Mine Plan';
-- Set ML/ARD Management Plan to PMT
UPDATE mine_report_definition SET mine_report_due_date_type = 'PMT' WHERE report_name = 'ML/ARD Management Plan';
-- Set Mine Emergency Response Plan to AVA
UPDATE mine_report_definition SET mine_report_due_date_type = 'AVA' WHERE report_name = 'Mine Emergency Response Plan';
-- Set Dump Runout Zone Procedure to AVA
UPDATE mine_report_definition SET mine_report_due_date_type = 'AVA' WHERE report_name = 'Dump Runout Zone Procedure';
-- Set Mine Plan, Reclamation and Closure Plan Updates to ANV
UPDATE mine_report_definition SET mine_report_due_date_type = 'ANV' WHERE report_name = 'Mine Plan, Reclamation and Closure Plan Updates';
-- Set Annual Summary of Work and Reclamation Report to AVA
UPDATE mine_report_definition SET mine_report_due_date_type = 'AVA' WHERE report_name = 'Annual Summary of Work and Reclamation Report';
-- Set Dam Safety Review to ANV
UPDATE mine_report_definition SET mine_report_due_date_type = 'ANV' WHERE report_name = 'Dam Safety Review';
-- Set Design Summary Document to ANV
UPDATE mine_report_definition SET mine_report_due_date_type = 'ANV' WHERE report_name = 'Design Summary Document';
-- Set Tailings Storage Facility or Dam As-built Report to ANV
UPDATE mine_report_definition SET mine_report_due_date_type = 'ANV' WHERE report_name = 'Tailings Storage Facility or Dam As-built Report';
-- Set Ongoing Management Requirements to AVA
UPDATE mine_report_definition SET mine_report_due_date_type = 'AVA' WHERE report_name = 'Ongoing Management Requirements';
-- Set Annual Summary of Placer Activities to PMT
UPDATE mine_report_definition SET mine_report_due_date_type = 'PMT' WHERE report_name = 'Annual Summary of Placer Activities';
-- Set Closure Plan (detailed) to ANV
UPDATE mine_report_definition SET mine_report_due_date_type = 'ANV' WHERE report_name = 'Closure Plan (detailed)';


-- Set Annual Safety Statistics Report to YRL
UPDATE mine_report_definition SET mine_report_due_date_type = 'YRL' WHERE report_name = 'Annual Safety Statistics Report';
-- Set Annual Summary of Exploration Activities to YRL
UPDATE mine_report_definition SET mine_report_due_date_type = 'YRL' WHERE report_name = 'Annual Summary of Exploration Activities';



-- Below contains queries to insert TSF as a mine report category for the TSF related mine report definitions
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mrd.mine_report_definition_id, 'TSF'
FROM mine_report_definition mrd
WHERE mrd.report_name = 'First Nations Engagement (requested)'
  AND NOT EXISTS (
      SELECT 1
      FROM mine_report_category_xref x
      WHERE x.mine_report_definition_id = mrd.mine_report_definition_id
        AND x.mine_report_category = 'TSF'
  )
ON CONFLICT DO NOTHING;

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mrd.mine_report_definition_id, 'TSF'
FROM mine_report_definition mrd
WHERE mrd.report_name = 'Summary of TSF or Dam Safety Recommendations'
  AND NOT EXISTS (
      SELECT 1
      FROM mine_report_category_xref x
      WHERE x.mine_report_definition_id = mrd.mine_report_definition_id
        AND x.mine_report_category = 'TSF'
  )
ON CONFLICT DO NOTHING;

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mrd.mine_report_definition_id, 'TSF'
FROM mine_report_definition mrd
WHERE mrd.report_name = 'Summary of Tailings Storage Facility (TSF) or Dam Safety Recommendations'
  AND NOT EXISTS (
      SELECT 1
      FROM mine_report_category_xref x
      WHERE x.mine_report_definition_id = mrd.mine_report_definition_id
        AND x.mine_report_category = 'TSF'
  )
ON CONFLICT DO NOTHING;

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mrd.mine_report_definition_id, 'TSF'
FROM mine_report_definition mrd
WHERE mrd.report_name = 'Performance of High Risk Dumps'
  AND NOT EXISTS (
      SELECT 1
      FROM mine_report_category_xref x
      WHERE x.mine_report_definition_id = mrd.mine_report_definition_id
        AND x.mine_report_category = 'TSF'
  )
ON CONFLICT DO NOTHING;

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mrd.mine_report_definition_id, 'TSF'
FROM mine_report_definition mrd
WHERE mrd.report_name = 'Tailings Storage Facility and Dam Registry'
  AND NOT EXISTS (
      SELECT 1
      FROM mine_report_category_xref x
      WHERE x.mine_report_definition_id = mrd.mine_report_definition_id
        AND x.mine_report_category = 'TSF'
  )
ON CONFLICT DO NOTHING;
