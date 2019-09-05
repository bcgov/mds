--delete all the data generated in functional test
DO $$
DECLARE
    IDIR_USER varchar = '%bdd-test%';
BEGIN
    DELETE FROM mine_party_appt WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_party_appt
    WHERE permit_guid = ANY (
        SELECT permit_guid FROM permit WHERE create_user LIKE IDIR_USER
    );
    DELETE FROM permit_amendment_document
    WHERE permit_amendment_id = ANY (
        SELECT permit_amendment_id FROM permit_amendment
        WHERE permit_id = ANY (
        SELECT permit_id FROM permit WHERE create_user LIKE IDIR_USER)
    );
    DELETE FROM permit_amendment
    WHERE permit_id = ANY (
        SELECT permit_id FROM permit WHERE create_user LIKE IDIR_USER
    );
    DELETE FROM permit WHERE create_user LIKE IDIR_USER;
    DELETE FROM party_address_xref
    WHERE party_guid = ANY (
        SELECT party_guid
        FROM party
        WHERE create_user LIKE IDIR_USER
    );
    DELETE FROM party WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_status_xref WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_status WHERE create_user LIKE IDIR_USER;
    DELETE FROM mine_party_appt
    WHERE mine_guid = ANY (
        SELECT mine_guid FROM mine_tailings_storage_facility WHERE create_user LIKE IDIR_USER
    );
    DELETE FROM mine_tailings_storage_facility WHERE create_user LIKE IDIR_USER;
	
    DELETE FROM mine_report_document_xref;
    DELETE FROM mine_report_submission;
    DELETE FROM mine_report;
	
    DELETE FROM variance_document_xref WHERE mine_document_guid = ANY (
        SELECT mine_document_guid FROM mine_document WHERE create_user LIKE IDIR_USER
    );
    DELETE FROM mine_document WHERE create_user LIKE IDIR_USER;

    DELETE FROM mine_type_detail_xref
    WHERE mine_type_guid = ANY (
        SELECT mine_type_guid FROM mine_type
        WHERE mine_guid = ANY (
        SELECT mine_guid FROM mine
        WHERE create_user LIKE IDIR_USER
    ));
    DELETE FROM mine_type
    WHERE mine_guid = ANY (
        SELECT mine_guid FROM mine
        WHERE create_user LIKE IDIR_USER
    );
    DELETE FROM variance
    WHERE mine_guid = ANY (
        SELECT mine_guid FROM mine
        WHERE create_user LIKE IDIR_USER
    );
    DELETE FROM mine WHERE create_user LIKE IDIR_USER;

END
$$;
