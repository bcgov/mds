-- Deletes all objects associated with a notice of work. The tree of objects to delete:
--
--	now_application_identity (mine_guid, permit_id)
--		now_application (now_application_id)
--			now_party_appointment (now_application_id)
--			activity_summary (now_application_id)
--			now_application_review (now_application_id)
--				now_application_document_xref (now_application_id)
--			state_of_land (now_application_id)
--			blasting_operation (now_application_id)
--			now_application_placer_xref (now_application_id)
--				placer_operation (activity_summary_id)
--			now_application_settling_pond_xref (now_application_id)
--				settling_pond (activity_summary_id)
--			now_application_progress (now_application_id)
--

-- Create the function.
CREATE OR REPLACE FUNCTION delete_now(_now_number varchar) RETURNS VOID AS $$

DECLARE
    -- Declare the variables.
_now_application_id bigint;
    _now_application_guid uuid;
    now_application_ids integer[];
    activity_summary_ids integer[];

BEGIN

    -- Get the now_application_id.
SELECT now_application_id INTO _now_application_id
FROM now_application_identity
WHERE now_number = _now_number;

-- Get the now_application_guid.
SELECT now_application_guid INTO _now_application_guid
FROM now_application_identity
WHERE now_application_id = _now_application_id;

-- Delete the records associated with Notices of Work.
RAISE NOTICE 'Deleting records associated with Notices of Work';

SELECT array_agg(activity_summary_id) INTO activity_summary_ids
FROM activity_summary
WHERE now_application_id = _now_application_id;

DELETE FROM now_party_appointment
WHERE now_application_id = _now_application_id;

DELETE FROM now_application_placer_xref
WHERE now_application_id = _now_application_id;

DELETE FROM placer_operation
WHERE activity_summary_id = ANY(activity_summary_ids);

DELETE FROM now_application_settling_pond_xref
WHERE now_application_id = _now_application_id;

DELETE FROM settling_pond
WHERE activity_summary_id = ANY(activity_summary_ids);

DELETE FROM camp
WHERE activity_summary_id = ANY(activity_summary_ids);

DELETE FROM exploration_surface_drilling
WHERE activity_summary_id = ANY(activity_summary_ids);

DELETE FROM exploration_access
WHERE activity_summary_id = ANY(activity_summary_ids);

DELETE FROM sand_gravel_quarry_operation
WHERE activity_summary_id = ANY(activity_summary_ids);

DELETE FROM surface_bulk_sample
WHERE activity_summary_id = ANY(activity_summary_ids);

DELETE FROM underground_exploration
WHERE activity_summary_id = ANY(activity_summary_ids);

DELETE FROM state_of_land
WHERE now_application_id = _now_application_id;

DELETE FROM blasting_operation
WHERE now_application_id = _now_application_id;

DELETE FROM now_application_progress
WHERE now_application_id = _now_application_id;

DELETE FROM now_application_document_xref
WHERE now_application_id = _now_application_id;

DELETE FROM now_application_review
WHERE now_application_id = _now_application_id;

DELETE FROM now_application_identity
WHERE now_application_guid = _now_application_guid;

DELETE FROM now_application
WHERE now_application_id = _now_application_id;

DELETE FROM activity_summary
WHERE activity_summary_id = ANY(activity_summary_ids);


-- Delete the record.
RAISE NOTICE 'Deleting the record';



    RAISE NOTICE 'Successfully deleted all records';
END;

$$ LANGUAGE PLPGSQL;

-- Call the function.
-- NOTE: Manually check/add the records to delete here before running this script.
-- SELECT delete_now('1640544-2021-01');

-- Drop the function.
DROP FUNCTION delete_now(varchar, varchar);
