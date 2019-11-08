SELECT permit_no, mine_guid, MIN(permit_id) as permit_id, count(*)
INTO temporary table duplicate_permits
FROM permit 
GROUP BY permit_no, mine_guid 
HAVING count(permit_no) > 1;


SELECT permit_amendment_id, permit_id, 
(select dp.permit_id from duplicate_permits dp join permit p on dp.permit_no = p.permit_no and dp.mine_guid=p.mine_guid where 
p.permit_id=permit_amendment.permit_id) as new_permit_id
INTO duplicate_permit_mapping
FROM permit_amendment
WHERE permit_amendment_id IN 
(select pa.permit_amendment_id from permit_amendment pa join permit p on pa.permit_id = p.permit_id join duplicate_permits dp on p.permit_no = dp.permit_no and p.mine_guid=dp.mine_guid);


UPDATE permit_amendment SET permit_id=(select new_permit_id from duplicate_permit_mapping dp WHERE permit_amendment.permit_amendment_id=dp.permit_amendment_id)
WHERE permit_amendment_id IN (select permit_amendment_id from duplicate_permit_mapping);

DELETE FROM mine_party_appt where permit_guid in (select p.permit_id from permit p left join permit_amendment pa on p.permit_id=pa.permit_id where pa.permit_id is null);
DELETE FROM permit where permit_id in (select p.permit_id from permit p left join permit_amendment pa on p.permit_id=pa.permit_id where pa.permit_id is null);