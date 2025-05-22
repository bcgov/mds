
-- MDS-6062, Cleanup draft permits of transferred now applications
CREATE TEMPORARY TABLE original_now_permits AS (
	SELECT
		pa.permit_id,
		pa.mine_guid AS old_mine_guid,
		na.mine_guid AS new_mine_guid
	FROM permit_amendment pa
	JOIN now_application_identity na ON pa.now_application_guid = na.now_application_guid
	WHERE pa.permit_amendment_status_code = 'DFT'
	AND pa.mine_guid != na.mine_guid
);

-- Create new xref
INSERT INTO mine_permit_xref (mine_guid, permit_id, create_user, create_timestamp, update_user, update_timestamp, start_date)
SELECT 
  new_mine_guid,
  permit_id,
  'system-mds',
  NOW(),
  'system-mds',
  NOW(),
  NOW()
FROM original_now_permits;

-- Update mine_guid
UPDATE permit_amendment pa
SET mine_guid = onp.new_mine_guid
FROM original_now_permits onp
WHERE pa.permit_id = onp.permit_id;

-- Soft delete old xref
UPDATE mine_permit_xref mp
SET deleted_ind = TRUE,
  update_user = 'system-mds',
  update_timestamp = NOW()
FROM original_now_permits onp
WHERE mp.mine_guid = onp.old_mine_guid
  AND mp.permit_id = onp.permit_id;

-- Cleanup
DROP TABLE original_now_permits;