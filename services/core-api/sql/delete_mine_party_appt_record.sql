-- Deletes the given mine party appointment and associated document references.
-- Raises exception if trying to delete an appointment that is part of an explosives permit.

CREATE OR REPLACE FUNCTION delete_mine_party_appt(_party_appt_guid varchar) RETURNS VOID AS $$

DECLARE
	_party_appt_guid uuid;
	_party_appt_id integer;
    _mine_guid uuid;

	explosives_permit_mm integer[];
	explosives_permit_perm integer[];

BEGIN

	-- Look up mine party appointments to make sure it exists
	SELECT mine_party_appt_guid INTO _party_appt_guid
	FROM mine_party_appt
	WHERE mine_party_appt_guid = _party_appt_guid;

	SELECT mine_party_appt_id INTO _party_appt_id
	FROM mine_party_appt
	WHERE mine_party_appt_guid = _party_appt_guid;

	SELECT array_agg(mine_manager_mine_party_appt_id) INTO explosives_permit_mm
	FROM explosives_permit
	WHERE mine_manager_mine_party_appt_id = _party_appt_id;

	SELECT array_agg(permittee_mine_party_appt_id) INTO explosives_permit_mm
	FROM explosives_permit
	WHERE permittee_mine_party_appt_id = _party_appt_id;
    
    -- Make sure party is not listed on an explosives permit, as that will need some additional considerations
    IF array_length(explosives_permit_mm, 1) > 0 OR array_length(explosives_permit_perm, 1) > 0 THEN
        RAISE EXCEPTION 'Party is listed on permit, cannot delete';
    END IF;

	RAISE NOTICE 'Deleting records associated with the mine_party_appt_guid record with mine_guid %', _mine_guid;

    DELETE FROM mine_party_appt_document_xref
    WHERE mine_party_appt_id=_party_appt_id;

	-- Get the mine_guid associated with this party.
	SELECT mine_guid INTO _mine_guid
	FROM mine_party_appt
	WHERE mine_party_appt_guid=_party_appt_guid;

	-- Delete the record.
	RAISE NOTICE 'Deleting appointment';

    -- Delete appointment
    DELETE FROM mine_party_appt
    WHERE mine_party_appt_guid=_party_appt_guid;

	RAISE NOTICE 'Successfully deleted appointment %s', _party_appt_guid;
END;

$$ LANGUAGE PLPGSQL;

-- Call the function.
-- NOTE: Manually check/add the records to delete here before running this script.
-- SELECT delete_mine_party_appt('f87dbc7b-f9f2-4579-9d42-23918ea70916');
-- SELECT delete_mine_party_appt('60d66828-8a41-4427-9d9b-4ccc1c6dc492');

-- Ran Oct 12, 2023
-- SELECT delete_mine_party_appt('256e3afe-bdc0-4613-8eea-07ea178864eb');

-- Drop the function.
DROP FUNCTION delete_mine_party_appt(varchar);
