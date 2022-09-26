-- NOTE: Much of the logic was originally derived from delete_mine_permit_xref_record.sql
-- Transfers all objects associated with a permit/mine pair to another mine. The tree of objects to transfer:
--
--mine_permit_xref (mine_guid, permit_id)
--  explosives_permit (mine_guid, permit_guid)
--	mine_report (mine_guid, permit_id)
--		mine_report_submission (mine_report_id)
--			mine_report_comment (mine_report_submission_id)
--	permit_amendment (mine_guid, permit_id)
--		permit_amendment_document (permit_amendment_id)
--		permit_conditions (permit_amendment_id)
--	now_application_identity (mine_guid, permit_id)
--		now_application (now_application_id)
--			now_party_appointment (now_application_id)
--			activity_summary (now_application_id)
--			now_application_review (now_application_id)
--				now_application_document_xref (now_application_id)
--					mine_document (mine_document_guid)
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
	_permit_guid uuid;
	_source_mine_guid uuid;
	_destination_mine_guid uuid;
	_permit_amendment_ids integer[];
	_now_application_guids uuid[];
	_now_application_ids integer[];
	_mine_document_guids uuid[];
	_mine_permit_xref_record record;

BEGIN

	-- Get the permit_id, permit_guid associated with the source permit number.
	SELECT permit_id INTO _permit_id
	FROM permit
	WHERE permit_no = _permit_no;

	SELECT permit_guid INTO _permit_guid
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

	RAISE NOTICE 'Transferring records associated with the mine_permit_xref record with permit_id % and mine_guid % to mine_guid %', _permit_id, _source_mine_guid, _destination_mine_guid;

	-- Transfer the records associated with explosive permits.
	RAISE NOTICE 'Transferring records associated with explosives permits';

	UPDATE explosives_permit SET mine_guid = _destination_mine_guid
	WHERE mine_guid = _source_mine_guid AND permit_guid = _permit_guid;

	-- Transfer the records associated with mine reports.
	RAISE NOTICE 'Transferring records associated with mine reports';

	UPDATE mine_report SET mine_guid = _destination_mine_guid
	WHERE mine_guid = _source_mine_guid AND permit_id = _permit_id;

	-- Transfer the records associated with Notices of Work.
	RAISE NOTICE 'Transferring records associated with Notices of Work';

	SELECT array_agg(permit_amendment_id) INTO _permit_amendment_ids
	FROM permit_amendment
	WHERE mine_guid = _source_mine_guid AND permit_id = _permit_id;

	SELECT array_agg(now_application_guid) INTO _now_application_guids
	FROM permit_amendment
	WHERE permit_amendment_id = ANY(_permit_amendment_ids);

	SELECT array_agg(now_application_id) INTO _now_application_ids
	FROM now_application_identity
	WHERE now_application_guid = ANY(_now_application_guids);

	-- Documents Uploaded
	SELECT array_agg(mine_document_guid) INTO _mine_document_guids
	FROM now_application_document_xref
	WHERE now_application_id = ANY(_now_application_ids);

	UPDATE mine_document SET mine_guid = _destination_mine_guid
	WHERE mine_guid = _source_mine_guid AND mine_document_guid = ANY(_mine_document_guids);

	-- Documents Imported
	SELECT array_agg(mine_document_guid) INTO _mine_document_guids
	FROM now_application_document_identity_xref
	WHERE now_application_id = ANY(_now_application_ids);

	UPDATE mine_document SET mine_guid = _destination_mine_guid
	WHERE mine_guid = _source_mine_guid AND mine_document_guid = ANY(_mine_document_guids);


	UPDATE now_application_identity SET mine_guid = _destination_mine_guid
	WHERE mine_guid = _source_mine_guid AND now_application_guid = ANY(_now_application_guids);

	---- Transfer the parent xref record ----
	RAISE NOTICE 'Transferring the parent xref record';
	
	-- Create new destination parent xref record
	SELECT start_date, end_date, create_user, create_timestamp, update_user, update_timestamp INTO _mine_permit_xref_record
	FROM mine_permit_xref WHERE mine_guid = _source_mine_guid AND permit_id = _permit_id
	LIMIT 1; 

	INSERT INTO mine_permit_xref (mine_guid, permit_id, start_date, end_date, create_user, create_timestamp, update_user, update_timestamp)
	VALUES(
		_destination_mine_guid, _permit_id, _mine_permit_xref_record.start_date, _mine_permit_xref_record.end_date, 
		_mine_permit_xref_record.create_user, _mine_permit_xref_record.create_timestamp, _mine_permit_xref_record.update_user,
		_mine_permit_xref_record.update_timestamp
	);

	-- Mark source parent xref as deleted
	UPDATE mine_permit_xref SET deleted_ind = true
	WHERE mine_guid = _source_mine_guid AND permit_id = _permit_id;

	-- Transfer the records associated with permit amendments.
	RAISE NOTICE 'Transferring records associated with permit amendments';

	UPDATE permit_amendment SET mine_guid = _destination_mine_guid
	WHERE mine_guid = _source_mine_guid AND permit_id = _permit_id;

	RAISE NOTICE 'Successfully transferred all records';
END;

$$ LANGUAGE PLPGSQL;

-- Call the function.
-- NOTE: Manually check/add the records to transfer here before running this script.
-- SELECT transfer_mine_permit_xref('MX-2-16', '0200115', '0200198');

-- Drop the function.
DROP FUNCTION transfer_mine_permit_xref(varchar, varchar, varchar);
