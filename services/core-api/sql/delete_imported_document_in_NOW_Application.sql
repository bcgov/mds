	
CREATE OR REPLACE FUNCTION delete_imported_document_in_NOW_Application(_file_name varchar, _mine_document_guid uuid) RETURNS VOID AS $$

DECLARE 
	_message_id integer;
	
BEGIN 
	SELECT messageid INTO _message_id
	FROM now_application_document_identity_xref 
	WHERE filename = _file_name
	AND mine_document_guid = _mine_document_guid;

	DELETE FROM now_submissions.document WHERE filename = _filename and messageid = _message_id;

	DELETE FROM now_application_document_identity_xref WHERE filename = _filename and mine_document_guid = _mine_document_guid and messageid = _message_id;

	UPDATE mine_document SET deleted_ind = true WHERE document_name = _filename and mine_document_guid = _mine_document_guid;

    RAISE NOTICE 'Deleted the % document.', _file_name;

END;

$$ LANGUAGE PLPGSQL;

DROP FUNCTION delete_imported_document_in_NOW_Application(varchar, uuid);