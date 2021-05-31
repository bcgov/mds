ALTER TABLE public.activity_equipment_xref ADD column IF NOT EXISTS now_application_id int4 NULL;

ALTER TABLE public.activity_equipment_xref ADD CONSTRAINT equipment_now_application_id_fkey FOREIGN KEY (now_application_id) REFERENCES public.now_application(now_application_id);

ALTER TABLE public.activity_equipment_xref DROP CONSTRAINT IF EXISTS equipment_assignment_pkey;

ALTER TABLE public.activity_equipment_xref ALTER COLUMN activity_summary_id DROP NOT NULL;

-- populate now_application_id based on summary id
WITH query AS (
	SELECT e.equipment_id, na.now_application_id FROM equipment e 
	JOIN activity_equipment_xref aex ON e.equipment_id = aex.equipment_id
	JOIN activity_summary as2 ON as2.activity_summary_id = aex.activity_summary_id 
	JOIN now_application na ON na.now_application_id = as2.now_application_id 
)
UPDATE activity_equipment_xref
SET now_application_id=query.now_application_id
FROM query
WHERE activity_equipment_xref.equipment_id = query.equipment_id;

ALTER TABLE public.activity_equipment_xref ADD PRIMARY KEY (equipment_id, now_application_id);

CREATE TABLE NOW_Submissions.application_equipment_xref (
	MESSAGEID integer,
	EQUIPMENTID integer,

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (EQUIPMENTID) REFERENCES NOW_Submissions.equipment(EQUIPMENTID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE now_submissions.equipment RENAME COLUMN sizecapacity TO "size";