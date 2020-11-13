-- Deletes all objects associated with a permit/mine pair. The tree of objects to delete:
-- 
--mine_permit_xref (mine_guid, permit_id)
--	mine_report (mine_guid, permit_id)
--		mine_report_submission (mine_report_id)
--			mine_report_comment (mine_report_submission_id)
--	permit_amendment (mine_guid, permit_id)
--		permit_amendment_document (permit_amendment_id)
--		permit_conditions (permit_amendment_id)
--		now_application_identity (mine_guid, permit_id)
--			now_application (now_application_id)
--				[a lot of objects: now_application_review, state_of_land, now_application_settling_pond_xref, etc.] (now_application_id)

CREATE OR REPLACE FUNCTION delete_mine_permit_xref (permit_no varchar, mine_no varchar)
RETURNS BOOLEAN AS $$

DECLARE
	permit_id integer;
	mine_guid uuid;

	mine_report_ids integer;
	mine_report_submission_ids integer[];
	
	now_application_id integer;
	permit_amendment_id integer;

BEGIN

	-- Get the permit_id associated with this permit number.
	SELECT permit_id INTO permit_id
	FROM permit
	WHERE permit_no = $1;

	-- Get the mine_guid associated with this mine number.
	SELECT mine_guid INTO mine_guid
	FROM mine
	WHERE mine_no = $2;

	RAISE NOTICE 'Deleting objects associated with the permit_id % and mine_guid %', permit_id, mine_guid;

	-- Delete the objects associated with mine reports.
	SELECT mine_report_id INTO mine_report_ids
	FROM mine_report
	WHERE mine_guid = mine_guid AND permit_id = permit_id;

	SELECT mine_report_submission_id INTO mine_report_submission_ids
	FROM mine_report_submission
	WHERE mine_report_id = ANY(mine_report_ids);

	DELETE FROM mine_report_comment
	WHERE mine_report_submission_id = ANY(mine_report_submission_ids);

	DELETE FROM mine_report_submission
	WHERE mine_report_submission_id = ANY(mine_report_submission_ids);

	DELETE FROM mine_report
	WHERE mine_report_id = ANY(mine_report_ids);

	-- Delete the objects associated with permit amendments.

END;
$$ LANGUAGE PLPGSQL;