/** 
 This query was used to get the mine guids for the old and new mine. Old Mine number = 1500438, new Mine number = 2000467
 SELECT * FROM mine WHERE mine_no in ('2000467', '1500438');
 old mine_guid 30c8a52d-3c44-4479-8d7f-c35d4d64d1c9, 
 new mine_guid: de5252ef-5342-456a-b7d3-981c96f53d6d 
 
 This query was used to get the permit id
 SELECT * FROM permit WHERE permit_no = 'G-DRAFT-1500438-2021-01';
 permit_id: 49669
 **/
--
--
--
/** Apply soft delete to the old mine
 **/
UPDATE
    mine_permit_xref
SET
    deleted_ind = true
WHERE
    permit_id = 49669
    AND mine_guid = '30c8a52d-3c44-4479-8d7f-c35d4d64d1c9';

/** Here we insert the newly assigned mine guid into this table because the table (permit_amendment) 
 that needs to be updated references mine_guid column in this table. 
 **/
INSERT INTO
    mine_permit_xref (
        mine_guid,
        permit_id,
        create_user,
        create_timestamp,
        update_user,
        update_timestamp
    )
VALUES
    (
        'de5252ef-5342-456a-b7d3-981c96f53d6d',
        49669,
        'system-mds',
        now(),
        'system-mds',
        now()
    );

/** Here we update the mine_guid in the permit_amendment to  
 the mine_guid of the newly assigned mine.
 **/
UPDATE
    permit_amendment
SET
    mine_guid = 'de5252ef-5342-456a-b7d3-981c96f53d6d'
WHERE
    permit_id = 49669;