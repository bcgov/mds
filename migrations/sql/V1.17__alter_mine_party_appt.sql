ALTER TABLE public.mine_party_appt ADD start_date date;
ALTER TABLE public.mine_party_appt ADD end_date date;
ALTER TABLE public.mine_party_appt ADD active_ind boolean NOT NULL DEFAULT 'true' ;