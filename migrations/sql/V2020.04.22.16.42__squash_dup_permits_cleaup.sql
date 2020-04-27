ALTER TABLE public.mine_party_appt ADD CONSTRAINT mine_party_appt_permit_party_xref_fk FOREIGN KEY (permit_id, mine_guid) REFERENCES mine_permit_xref(permit_id, mine_guid);

--clean up 
ALTER TABLE public.mine_party_appt DROP CONSTRAINT mine_party_appt_permit_party_fk; 
ALTER TABLE public.mine_party_appt DROP COLUMN permit_guid;
--delete newly orphaned records
--none of these duplicate records have had their permittee's changed
ALTER TABLE permit DROP CONSTRAINT if exists permit_mine_guid_fkey;
ALTER TABLE permit DROP COLUMN mine_guid

--run this adhoc after validation

-- DELETE FROM permit p where p.permit_id not in (select permit_id from permit_amendment);
-- delete from mine_party_appt where permit_id not in (select permit_id from public.mine_permit_xref);
-- delete from permit_amendment where permit_id not in (select permit_id from mine_permit_xref);
-- DELETE FROM permit where permit_id not in (select permit_id from mine_permit_xref);
-- next migration will set permit_no unique