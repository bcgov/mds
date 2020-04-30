
ALTER TABLE public.permit ADD CONSTRAINT permit_mine_guid_permit_no_unique UNIQUE (mine_guid, permit_no);