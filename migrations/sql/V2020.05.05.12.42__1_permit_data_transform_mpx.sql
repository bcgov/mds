
CREATE TABLE mine_permit_xref (
    mine_guid uuid NOT NULL,
    permit_id integer NOT NULL,
    start_date date,
    end_date date,
    deleted_ind boolean DEFAULT false NOT NULL,
    create_user               varchar                                 NOT null,  
    create_timestamp          timestamp with time zone DEFAULT now()  NOT NULL,  
    update_user               varchar                                 NOT null,
    update_timestamp          timestamp with time zone DEFAULT now()  NOT null,

    FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (permit_id) REFERENCES permit(permit_id) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE mine_permit_xref OWNER TO mds;

---1a--migrate mine_guid, permit_id from permit to mine_permit_xref
INSERT INTO mine_permit_xref
SELECT p.mine_guid, p.permit_id, null,null,false, p.create_user, p.create_timestamp, p.create_user, p.create_timestamp 
from permit p; 


--migrate mine_guid from permit to permit_amendment
ALTER TABLE permit_amendment ADD COLUMN mine_guid uuid;
---1b--move mine_guid from permit to permit_amendment
UPDATE permit_amendment pa
set mine_guid = p.mine_guid
from permit p 
where p.permit_id = pa.permit_id;

ALTER TABLE permit_amendment ALTER COLUMN mine_guid set NOT NULL; 


---2--reassign permit_amendment parent to common permit record (one for each number)
UPDATE permit_amendment pa
set permit_id = (select p2.permit_id from permit p2 where p2.permit_no = p.permit_no order by p2.permit_id limit 1)
from permit p
where p.permit_id = pa.permit_id;

---4--reassign mine_permit_xref to one common permit record (one for each number)
update mine_permit_xref mpx
set permit_id = (select p2.permit_id from permit p2 where p2.permit_no = p.permit_no order by p2.permit_id limit 1)
from permit p
where p.permit_id = mpx.permit_id;
--delete multiplicity


---6--reassign mine_report records to point to common permit record (one for each number) (delete mine_guids, only permits, see ---??? below)
update mine_report mr
set permit_id = (select p2.permit_id from permit p2 where p2.permit_no = p.permit_no order by p2.permit_id limit 1)
from permit p
where p.permit_id = mr.permit_id;

---5--reassign permittee records to point to common permit record (one for each number) (delete mine_guids, only permits, see ---??? below)
ALTER TABLE public.mine_party_appt ADD COLUMN permit_id integer;
UPDATE public.mine_party_appt mpa
set permit_id = mpx.permit_id
from permit p
 	inner join mine_party_appt mpa2 on mpa2.permit_guid = p.permit_guid
 	inner join permit p2 on p.permit_no  = p2.permit_no
 	inner join mine_permit_xref mpx on mpx.permit_id = p2.permit_id
    inner join permit_amendment pa on pa.permit_id = p2.permit_id
where mpa.mine_party_appt_guid = mpa2.mine_party_appt_guid
and mpa.permit_guid = p.permit_guid
and mpx.permit_id is not null;

--make sure permit exists, but this doesn't enforce permit/mine pairs.... not sure how to.
ALTER TABLE mine_party_appt ADD CONSTRAINT mine_party_appt_permit_permit_id_fk FOREIGN KEY (permit_id) REFERENCES permit(permit_id);

--Permitees aren't related to mines, only permit numbers
ALTER TABLE mine_party_appt ALTER COLUMN mine_guid DROP NOT NULL; 
UPDATE mine_party_appt 
set mine_guid = null 
where mine_party_appt_type_code = 'PMT';
