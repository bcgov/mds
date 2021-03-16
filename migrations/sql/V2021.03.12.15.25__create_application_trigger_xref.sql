
CREATE TABLE IF NOT EXISTS public.application_trigger_xref (
	now_application_guid uuid NOT NULL,
	application_trigger_type_code varchar(3) NOT NULL,
	CONSTRAINT application_trigger_xref_xref_pkey PRIMARY KEY (now_application_guid, application_trigger_type_code)
);

ALTER TABLE public.application_trigger_xref ADD CONSTRAINT application_trigger_xref_application_trigger_fkey FOREIGN KEY (application_trigger_type_code) REFERENCES application_trigger_type_code(application_trigger_type_code);
ALTER TABLE public.application_trigger_xref ADD CONSTRAINT application_trigger_xref_application_guid_fkey FOREIGN KEY (now_application_guid) REFERENCES now_application_identity(now_application_guid);
