-- Deletes the given mine tailing storage facility and its associated mine_party appointment, document references, and dams.
-- Raises exception if trying to delete an appointment that is part of an explosives permit.

CREATE OR REPLACE FUNCTION delete_mine_tailings_storage_facility(_mine_guid uuid, _mine_tsf_guid uuid) RETURNS VOID AS $$

DECLARE
	_party_appt_id integer[];

	explosives_permit_mm integer[];
	explosives_permit_perm integer[];

BEGIN
	SELECT array_agg(mine_party_appt_id) INTO _party_appt_id
	FROM mine_party_appt
	WHERE mine_guid = _mine_guid AND mine_tailings_storage_facility_guid = _mine_tsf_guid;

	SELECT array_agg(mine_manager_mine_party_appt_id) INTO explosives_permit_mm
	FROM explosives_permit
	WHERE mine_manager_mine_party_appt_id = ANY(_party_appt_id);

	SELECT array_agg(permittee_mine_party_appt_id) INTO explosives_permit_mm
	FROM explosives_permit
	WHERE permittee_mine_party_appt_id = ANY(_party_appt_id);
    
    -- Make sure party is not listed on an explosives permit, as that will need some additional considerations.
    IF array_length(explosives_permit_mm, 1) > 0 OR array_length(explosives_permit_perm, 1) > 0 THEN
        RAISE EXCEPTION 'Party is listed on permit, cannot delete';
    END IF;

	RAISE NOTICE 'Deleting document records ';

    DELETE FROM mine_party_appt_document_xref
    WHERE mine_party_appt_id = ANY(_party_appt_id);

	RAISE NOTICE 'Deleting appointments';

    -- Delete appointments associated with the tailings storage facility.
    DELETE FROM mine_party_appt
    WHERE mine_guid = _mine_guid AND mine_tailings_storage_facility_guid = _mine_tsf_guid;

	RAISE NOTICE 'Successfully deleted appointments associated with mine tailings storage facility %s', _mine_tsf_guid;

	RAISE NOTICE 'Deleting dams';

    -- Delete dams associated with the tailings storage facility.
    DELETE FROM dam
    WHERE mine_tailings_storage_facility_guid = _mine_tsf_guid;

	RAISE NOTICE 'Successfully deleted dams associated with mine tailings storage facility %s', _mine_tsf_guid;

	RAISE NOTICE 'Deleting tailing storage facility';

    -- Delete TSF.
    DELETE FROM mine_tailings_storage_facility
    WHERE mine_guid = _mine_guid AND mine_tailings_storage_facility_guid = _mine_tsf_guid;

	RAISE NOTICE 'Successfully deleted mine tailings storage facility %s', _mine_tsf_guid;

END;

$$ LANGUAGE PLPGSQL;

-- Call the function.
-- NOTE: Manually check/add the records to delete here before running this script.
-- SELECT delete_mine_tailings_storage_facility('bb1f168f-f900-4b94-917f-0d794452831b', '6523741c-ed6a-4c7a-9c72-e24bcb90e2b0');

-- Drop the function.
DROP FUNCTION delete_mine_tailings_storage_facility;