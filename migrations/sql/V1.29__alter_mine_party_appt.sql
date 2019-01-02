
ALTER TABLE public.mine_party_appt drop active_ind;
ALTER TABLE public.mine_party_appt add deleted_ind boolean NOT NULL DEFAULT 'false' ;
ALTER TABLE public.mine_party_appt DROP CONSTRAINT mine_party_appt_permit_fk;
ALTER TABLE permit ADD CONSTRAINT mine_permit_guid_unique UNIQUE (permit_guid, mine_guid);
ALTER TABLE public.mine_party_appt ADD CONSTRAINT mine_party_appt_permit_party_fk FOREIGN KEY (permit_guid,mine_guid) REFERENCES permit(permit_guid,mine_guid);