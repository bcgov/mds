--delete all the data generated in functional test
DO $$
DECLARE
    IDIR_USER varchar = '%bdd-test%';
BEGIN
DELETE FROM mgr_appointment WHERE create_user LIKE IDIR_USER;
DELETE FROM permit WHERE create_user LIKE IDIR_USER;
DELETE FROM permittee WHERE create_user LIKE IDIR_USER;
DELETE FROM party WHERE create_user LIKE IDIR_USER;
DELETE FROM mine_location WHERE create_user LIKE IDIR_USER;
DELETE FROM mine_status_xref WHERE create_user LIKE IDIR_USER;
DELETE FROM mineral_tenure_xref WHERE create_user LIKE IDIR_USER;
DELETE FROM mine_status WHERE create_user LIKE IDIR_USER;
DELETE FROM mine_detail WHERE create_user LIKE IDIR_USER;
DELETE FROM mine_tailings_storage_facility WHERE create_user LIKE IDIR_USER;
DELETE FROM mine_expected_document WHERE create_user LIKE IDIR_USER;
DELETE FROM mine_identity WHERE create_user LIKE IDIR_USER;

END $$;

