--delete all the data generated in functional test
DO $$
DECLARE
    IDIR_USER varchar = '%bdd-test%';
BEGIN
    DELETE FROM mine_party_appt WHERE create_user LIKE IDIR_USER;
    -- DELETE FROM permit_amendment_document
    -- WHERE permit_amendment_id = ANY (
    --     SELECT permit_amendment_id FROM permit_amendment
    --     WHERE permit_id = ANY (
    --     SELECT permit_id FROM permit WHERE create_user LIKE IDIR_USER)
    -- );
    -- DELETE FROM permit_amendment
    -- WHERE permit_id = ANY (
    -- SELECT permit_id FROM permit WHERE create_user LIKE IDIR_USER);
    -- DELETE FROM permit WHERE create_user LIKE IDIR_USER;
    DELETE FROM permit WHERE create_user LIKE IDIR_USER ON DELETE CASCADE;
    DELETE FROM party_address_xref
    WHERE party_guid = ANY (
    SELECT party_guid
    FROM party
    WHERE create_user LIKE IDIR_USER);
    DELETE FROM party WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_location WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_status_xref WHERE create_user LIKE IDIR_USER;
    DELETE FROM mineral_tenure_xref WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_status WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_tailings_storage_facility WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_document WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_expected_document_xref
    WHERE exp_document_guid = ANY(
    SELECT exp_document_guid
    FROM mine_expected_document
    WHERE create_user LIKE IDIR_USER);
    DELETE FROM mine_expected_document WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine WHERE create_user LIKE IDIR_USER;

END
$$;
