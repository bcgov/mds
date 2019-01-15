UPDATE mine_expected_document set exp_document_status_guid =
(
    SELECT exp_document_status_guid 
    FROM mine_expected_document_status 
    WHERE description = 'Not Received'
    limit 1
) 
    WHERE exp_document_status_guid IS NULL;

COMMIT;

ALTER TABLE mine_expected_document ALTER COLUMN exp_document_status_guid SET NOT NULL;