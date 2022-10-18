-- Deletes the given mine party appointment and associated document references.
-- Raises exception if trying to delete an appointment that is part of an explosives permit.

CREATE OR REPLACE FUNCTION delete_mine_party_appt(_party_appt_guid uuid) RETURNS VOID AS $$

DECLARE
	_party_appt_id integer;
    _mine_guid uuid;

	explosives_permit_mm integer[];
	explosives_permit_perm integer[];

BEGIN
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

	-- Get the mine_guid associated with this party.
	SELECT mine_guid INTO _mine_guid
	FROM mine_party_appt
	WHERE mine_party_appt_guid=_party_appt_guid;

	RAISE NOTICE 'Deleting records associated with the mine_party_appt_guid record with mine_guid %', _mine_guid;

    DELETE FROM mine_party_appt_document_xref
    WHERE mine_party_appt_id=_party_appt_id;

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

-- Ran Oct 18, 2023
-- SELECT delete_mine_party_appt('4d0856ef-eaa4-4d5f-ab48-aae5f9e021a2');
-- SELECT delete_mine_party_appt('9ab0de6a-ef31-4293-89c3-b27443752f28');

-- Drop the function.
DROP FUNCTION delete_mine_party_appt;