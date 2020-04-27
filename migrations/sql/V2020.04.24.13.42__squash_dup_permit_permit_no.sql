DELETE FROM permit where permit_id not in (select permit_id from mine_permit_xref);

ALTER TABLE public.permit ADD CONSTRAINT permit_permit_no_unique UNIQUE (permit_no);