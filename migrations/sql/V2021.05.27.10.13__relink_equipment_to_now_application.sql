ALTER TABLE public.activity_equipment_xref ADD column IF NOT EXISTS now_application_id int4 NULL;

ALTER TABLE public.activity_equipment_xref ADD CONSTRAINT equipment_now_application_id_fkey FOREIGN KEY (now_application_id) REFERENCES public.now_application(now_application_id);

ALTER TABLE public.activity_equipment_xref DROP CONSTRAINT IF EXISTS equipment_assignment_pkey;
-- TODO check if I need to manually remove NOT NULL constraint for this, (expected answer no)

ALTER TABLE public.activity_equipment_xref ADD PRIMARY KEY (equipment_id, now_application_id);

-- populate now_application_id based on summary id
with query as (
	select e.equipment_id, na.now_application_id from equipment e 
	join activity_equipment_xref aex on e.equipment_id = aex.equipment_id
	join activity_summary as2 on as2.activity_summary_id = aex.activity_summary_id 
	join now_application na on na.now_application_id = as2.now_application_id 
)
update activity_equipment_xref
set now_application_id=query.now_application_id
from query
WHERE activity_equipment_xref.equipment_id = query.equipment_id;
