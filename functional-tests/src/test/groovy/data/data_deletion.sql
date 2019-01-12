--delete all the data generated in functional test
DO $
$
DECLARE
    IDIR_USER varchar = '%bdd-test%';
BEGIN
    DELETE FROM permit WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_party_appt WHERE create_user LIKE IDIR_USER;
    DELETE FROM party WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_location WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_status_xref WHERE create_user LIKE IDIR_USER;
    DELETE FROM mineral_tenure_xref WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_status WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_tailings_storage_facility WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_expected_document WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine WHERE create_user LIKE IDIR_USER;

END
$$;
