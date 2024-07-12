ALTER TABLE public.permit DROP CONSTRAINT permit_permit_no_unique;

CREATE UNIQUE INDEX permit_permit_no_unique ON public.permit (permit_no) WHERE deleted_ind = FALSE;