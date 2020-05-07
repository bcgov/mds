
---1--create mine_permit_xref
---1a--migrate mine_guid, permit_id from permit to mine_permit_xref


---1b--move mine_guid from permit to permit_amendment
---2--reassign permit_amendment parent to common permit record (one for each number)
---4--reassign mine_permit_xref to one common permit record (one for each number)
---5--reassign permittee records to point to common permit record (one for each number) (delete mine_guids, only permits, see ---??? below)
---6--reassign mine_report records to point to common permit record (one for each number) (delete mine_guids, only permits, see ---??? below)
---???drop mine_party_appt mine_guid NOT NULL? or create party_permit_appt table? get some clarity here

---------------------------
------delete permit records that are duplicates and have no child permit amendments
------add unique permit_no constraint to permit table
------permit_amendment fk mine_guid, permit_id to mine_permit_xref
------mine_report fk mine_guid, permit_id to mine_permit_xref



---e1-update ETL_PERMIT to reflect these permit changes
---e2-update ETL_??? tables to reflect the permitee changes
---e3-update sp_permit_permitees to insert into this structure (maybe start from scratch)?
