CREATE UNIQUE INDEX mine_permit_xref_unique ON mine_permit_xref (mine_guid, permit_id) WHERE deleted_ind = false;

-- Cleanup transferred now_applications with mismatched mine_guids
-- Create new mine_permit_xref records
INSERT INTO mine_permit_xref (mine_guid, permit_id, create_user, create_timestamp)
SELECT 
    na.mine_guid AS now_application_mine_guid,
    pa.permit_id,
    'migration_script',
    NOW()
FROM now_application na
JOIN permit_amendment pa ON pa.now_application_guid = na.now_application_guid
WHERE pa.permit_amendment_status_code = 'DFT'
  AND pa.mine_guid != na.mine_guid;

-- Update mine_guid
UPDATE permit_amendment pa
SET mine_guid = na.mine_guid
FROM now_application na
WHERE pa.now_application_guid = na.now_application_guid
  AND pa.permit_amendment_status_code = 'DFT'
  AND pa.mine_guid != na.mine_guid;

-- Soft delete old mine_permit_xref records
UPDATE mine_permit_xref mp
SET deleted_ind = TRUE,
    update_user = 'migration_script',
    update_timestamp = NOW()
FROM permit_amendment pa
JOIN now_application na ON pa.now_application_guid = na.now_application_guid
WHERE mp.mine_guid = pa.mine_guid
  AND mp.permit_id = pa.permit_id
  AND pa.permit_amendment_status_code = 'DFT'
  AND pa.mine_guid != na.mine_guid;
