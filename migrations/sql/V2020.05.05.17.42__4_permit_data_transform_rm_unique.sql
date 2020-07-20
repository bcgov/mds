
------add unique permit_no constraint to permit table
ALTER TABLE public.permit ADD CONSTRAINT permit_permit_no_unique UNIQUE (permit_no);
