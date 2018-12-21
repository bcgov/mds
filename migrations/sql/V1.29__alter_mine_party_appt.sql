
ALTER TABLE public.mine_party_appt drop active_ind;
ALTER TABLE public.mine_party_appt add deleted_ind boolean NOT NULL DEFAULT 'false' ;