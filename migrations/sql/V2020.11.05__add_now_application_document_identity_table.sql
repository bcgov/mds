CREATE TABLE
IF NOT EXISTS now_application_document_identity_xref
(
	now_application_document_xref_guid uuid NOT NULL DEFAULT gen_random_uuid(),
	mine_document_guid uuid NOT NULL,
	messageid int4 NULL,
	documenturl varchar NULL,
	filename varchar NULL,
	documenttype varchar NULL,
	description varchar NULL,
	is_final_package bool NOT NULL DEFAULT false,
	create_user varchar NOT NULL,
	create_timestamp timestamptz NOT NULL DEFAULT now(),
	update_user varchar NOT NULL,
	update_timestamp timestamptz NOT NULL DEFAULT now(),
	now_application_id int4 NULL
);

ALTER TABLE now_application_document_identity_xref ADD CONSTRAINT now_application_document_identity_xref_fk FOREIGN KEY (now_application_id) REFERENCES now_application(now_application_id);
ALTER TABLE now_application_document_identity_xref ADD CONSTRAINT now_application_document_identity_xref_mine_document_guid_fkey FOREIGN KEY (mine_document_guid) REFERENCES mine_document(mine_document_guid);