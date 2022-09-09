-- Transfers all objects associated with a permit/mine pair to another mine. The tree of objects to transfer:
-- 
--mine_permit_xref (mine_guid, permit_id)
--	mine_report (mine_guid, permit_id)
--		mine_report_submission (mine_report_id)
--			mine_report_comment (mine_report_submission_id)
--	permit_amendment (mine_guid, permit_id)
--		permit_amendment_document (permit_amendment_id)
--		permit_conditions (permit_amendment_id)
--	now_application_identity (mine_guid, permit_id)
--		now_application (now_application_id)
--			now_party_appointment (now_application_id) * Should we check for dangling 'party' records and delete those?
--			activity_summary (now_application_id)
--			now_application_review (now_application_id)
--				now_application_document_xref (now_application_id)
--					mine_document (mine_document_guid) * Should we check for dangling 'mine_document' records and delete those? What about the actual files?
--			state_of_land (now_application_id)
--			blasting_operation (now_application_id)
--			now_application_placer_xref (now_application_id)
--				placer_operation (activity_summary_id)
--			now_application_settling_pond_xref (now_application_id)
--				settling_pond (activity_summary_id)
--			now_application_progress (now_application_id)
--

-- Create the function.
CREATE OR REPLACE FUNCTION transfer_mine_permit_xref(_permit_no varchar, _source_mine_no varchar, _destination_mine_no varchar) RETURNS VOID AS $$

DECLARE
	_permit_id integer;
	_source_mine_guid uuid;
	_destination_mine_guid uuid;
	_record record;
	mine_report_ids integer[];
	mine_report_submission_ids integer[];
	permit_amendment_ids integer[];
	now_application_guids uuid[];
	now_application_ids integer[];
	activity_summary_ids integer[];

BEGIN

	-- Get the permit_id associated with the source permit number.
	SELECT permit_id INTO _permit_id
	FROM permit
	WHERE permit_no = _permit_no;

	-- Get the mine_guid associated with the source mine number.
	SELECT mine_guid INTO _source_mine_guid
	FROM mine
	WHERE mine_no = _source_mine_no;

	-- Get the mine_guid associated with the destination mine number.
	SELECT mine_guid INTO _destination_mine_guid
	FROM mine
	WHERE mine_no = _destination_mine_no;

	-- RAISE NOTICE 'Deleting records associated with the mine_permit_xref record with permit_id % and mine_guid %', _permit_id, _mine_guid;
	RAISE NOTICE 'Transferring records associated with the mine_permit_xref record with permit_id % and mine_guid % to mine_guid %', _permit_id, _source_mine_guid, _destination_mine_guid;

	-- Delete the records associated with mine reports.
	-- RAISE NOTICE 'Deleting records associated with mine reports';
	-- Transfer the records associated with mine reports.
	RAISE NOTICE 'Transferring records associated with mine reports';

	SELECT array_agg(mine_report_id) INTO mine_report_ids
	FROM mine_report
	WHERE mine_guid = _mine_guid AND permit_id = _permit_id;

	SELECT array_agg(mine_report_submission_id) INTO mine_report_submission_ids
	FROM mine_report_submission
	WHERE mine_report_id = ANY(mine_report_ids);

	DELETE FROM mine_report_comment
	WHERE mine_report_submission_id = ANY(mine_report_submission_ids);

	DELETE FROM mine_report_submission
	WHERE mine_report_submission_id = ANY(mine_report_submission_ids);

	DELETE FROM mine_report
	WHERE mine_report_id = ANY(mine_report_ids);

	-- Delete the records associated with permit amendments.
	RAISE NOTICE 'Deleting records associated with permit amendments';

	SELECT array_agg(permit_amendment_id) INTO permit_amendment_ids
	FROM permit_amendment
	WHERE mine_guid = _mine_guid AND permit_id = _permit_id;

	SELECT array_agg(now_application_guid) INTO now_application_guids
	FROM permit_amendment
	WHERE permit_amendment_id = ANY(permit_amendment_ids); 

	DELETE FROM permit_amendment_document
	WHERE permit_amendment_id = ANY(permit_amendment_ids);

	DELETE FROM permit_conditions
	WHERE permit_amendment_id = ANY(permit_amendment_ids);

	DELETE FROM permit_amendment
	WHERE permit_amendment_id = ANY(permit_amendment_ids);

	-- Delete the records associated with Notices of Work.
	RAISE NOTICE 'Deleting records associated with Notices of Work';	

	SELECT array_agg(now_application_id) INTO now_application_ids
	FROM now_application_identity
	WHERE now_application_guid = ANY(now_application_guids);

	SELECT array_agg(activity_summary_id) INTO activity_summary_ids
	FROM activity_summary
	WHERE now_application_id = ANY(now_application_ids);

	-- TODO: What to do about potential dangling 'party' records?
	DELETE FROM now_party_appointment
	WHERE now_application_id = ANY(now_application_ids);

	DELETE FROM now_application_placer_xref
	WHERE now_application_id = ANY(now_application_ids);

	DELETE FROM placer_operation
	WHERE activity_summary_id = ANY(activity_summary_ids);

	DELETE FROM now_application_settling_pond_xref
	WHERE now_application_id = ANY(now_application_ids);

	DELETE FROM settling_pond
	WHERE activity_summary_id = ANY(activity_summary_ids);

	DELETE FROM activity_summary
	WHERE activity_summary_id = ANY(activity_summary_ids);

	DELETE FROM state_of_land
	WHERE now_application_id = ANY(now_application_ids);

	DELETE FROM blasting_operation
	WHERE now_application_id = ANY(now_application_ids);

	DELETE FROM now_application_progress
	WHERE now_application_id = ANY(now_application_ids);

	-- TODO: What to do about potential dangling 'mine_document' records? What about the actual files?
	DELETE FROM now_application_document_xref
	WHERE now_application_id = ANY(now_application_ids);

	DELETE FROM now_application_review
	WHERE now_application_id = ANY(now_application_ids);

	DELETE FROM now_application
	WHERE now_application_id = ANY(now_application_ids);

	DELETE FROM now_application_identity
	WHERE now_application_guid = ANY(now_application_guids);

	-- Delete the record.
	RAISE NOTICE 'Deleting the record';

	DELETE FROM mine_permit_xref
	WHERE mine_guid = _mine_guid AND permit_id = _permit_id;

	RAISE NOTICE 'Successfully deleted all records';
END;

$$ LANGUAGE PLPGSQL;

-- Call the function.
-- NOTE: Manually check/add the records to delete here before running this script.
-- SELECT delete_mine_permit_xref('MX-1-113', '0100086');
-- SELECT delete_mine_permit_xref('MX-1-134', '0100138');

-- Ran Aug 4th, 2022
-- SELECT delete_mine_permit_xref('G-10-63', '1000798')

-- Drop the function.
DROP FUNCTION delete_mine_permit_xref(varchar, varchar, varchar);
