CREATE TABLE now_application_document_index_run (
	create_user VARCHAR(60) NOT NULL,
	create_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	update_user VARCHAR(60) NOT NULL,
	update_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	now_application_document_index_run_id UUID NOT NULL DEFAULT gen_random_uuid(),
	now_application_guid UUID NOT NULL,
	status VARCHAR(255) NOT NULL,
	document_count INTEGER NOT NULL DEFAULT 0,
	items_processed INTEGER NOT NULL DEFAULT 0,
	error_count INTEGER NOT NULL DEFAULT 0,
	error_message VARCHAR,
	last_run_start TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	last_run_end TIMESTAMP WITHOUT TIME ZONE,
	core_status_task_id VARCHAR(255),
	PRIMARY KEY (now_application_document_index_run_id),
	FOREIGN KEY(now_application_guid) REFERENCES now_application_identity (now_application_guid)
);
CREATE INDEX IF NOT EXISTS now_application_document_index_run_guid_idx ON now_application_document_index_run (now_application_guid);
