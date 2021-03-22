CREATE TABLE IF NOT EXISTS public.amendment_reason_code_xref (
	now_application_id integer NOT NULL,
	amendment_reason_code varchar(3) NOT NULL,
	CONSTRAINT amendment_reason_code_xref_pkey PRIMARY KEY (now_application_id, amendment_reason_code)
);

ALTER TABLE public.amendment_reason_code_xref ADD CONSTRAINT amendment_reason_code_xref_amendment_reason_code_fkey FOREIGN KEY (amendment_reason_code) REFERENCES amendment_reason_code(amendment_reason_code);
ALTER TABLE public.amendment_reason_code_xref ADD CONSTRAINT amendment_reason_code_xref_application_id_fkey FOREIGN KEY (now_application_id) REFERENCES now_application(now_application_id);

ALTER TABLE now_application ADD COLUMN amendment_source_type_code varchar(3);
ALTER TABLE now_application ADD CONSTRAINT amendment_source_type_code_fk FOREIGN KEY (amendment_source_type_code) REFERENCES amendment_source_type_code(amendment_source_type_code);