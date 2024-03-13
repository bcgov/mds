ALTER TABLE mine_report_submission 
	ADD COLUMN IF NOT EXISTS is_latest boolean DEFAULT TRUE;

DO $$DECLARE report record;
BEGIN
	FOR report IN SELECT * FROM mine_report
	LOOP
		UPDATE mine_report_submission 
		SET is_latest = FALSE
		WHERE mine_report_submission.mine_report_id = report.mine_report_id 
		AND mine_report_submission_guid != 
			(SELECT mine_report_submission_guid FROM mine_report_submission 
				WHERE mine_report_submission.mine_report_id = report.mine_report_id
				ORDER BY mine_report_submission_id
				LIMIT 1
			)
		;
	END LOOP;
END
$$;