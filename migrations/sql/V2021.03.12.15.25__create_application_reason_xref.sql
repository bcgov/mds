CREATE TABLE IF NOT EXISTS public.application_reason_code_xref (
	now_application_id integer NOT NULL,
	application_reason_code varchar(3) NOT NULL,
	CONSTRAINT application_reason_code_xref_pkey PRIMARY KEY (now_application_id, application_reason_code)
);

ALTER TABLE public.application_reason_code_xref ADD CONSTRAINT application_reason_code_xref_application_reason_code_fkey FOREIGN KEY (application_reason_code) REFERENCES application_reason_code(application_reason_code);
ALTER TABLE public.application_reason_code_xref ADD CONSTRAINT application_reason_code_xref_application_id_fkey FOREIGN KEY (now_application_id) REFERENCES now_application(now_application_id);