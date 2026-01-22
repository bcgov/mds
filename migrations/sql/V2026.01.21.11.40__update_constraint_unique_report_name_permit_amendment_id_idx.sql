DROP INDEX IF EXISTS unique_report_name_permit_amendment_id_idx;
					
CREATE UNIQUE INDEX unique_report_name_permit_amendment_id_idx
ON mine_report_permit_requirement (report_name, permit_amendment_id)
WHERE report_name IS NOT NULL
AND deleted_ind = false;