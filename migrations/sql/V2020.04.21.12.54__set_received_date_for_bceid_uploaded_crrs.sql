UPDATE mine_report mr1
SET received_date = (
    SELECT MIN(submission_date)
    FROM mine_report mr2, mine_report_submission mrs
    WHERE mr1.mine_report_id = mr2.mine_report_id
        AND mrs.mine_report_id = mr1.mine_report_id
    )
WHERE mr1.created_by_idir ILIKE 'bceid%'
    AND mr1.received_date IS NULL;