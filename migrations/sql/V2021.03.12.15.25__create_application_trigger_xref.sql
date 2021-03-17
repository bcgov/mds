CREATE TABLE IF NOT EXISTS public.amendment_reason_xref (
	now_application_guid uuid NOT NULL,
	amendment_reason_code varchar(3) NOT NULL,
	CONSTRAINT amendment_reason_code_xref_pkey PRIMARY KEY (now_application_guid, amendment_reason_code)
);

ALTER TABLE public.amendment_reason_xref ADD CONSTRAINT amendment_reason_xref_amendment_reason_code_fkey FOREIGN KEY (amendment_reason_code) REFERENCES amendment_reason_code(amendment_reason_code);
ALTER TABLE public.amendment_reason_xref ADD CONSTRAINT amendment_reason_xref_application_guid_fkey FOREIGN KEY (now_application_guid) REFERENCES now_application_identity(now_application_guid);
