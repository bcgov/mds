CREATE TABLE IF NOT EXISTS permit_extraction_task (
    -- permit_extraction_task_guid UUID,
    permit_extraction_task_id SERIAL NOT NULL PRIMARY KEY,
    task_id VARCHAR(255), -- TODO: find out how many characters
    task_status VARCHAR(3), -- and this one
    permit_amendment_guid UUID NOT NULL,
    permit_amendment_document_guid UUID NOT NULL,

    create_user VARCHAR(60), 
	create_timestamp TIMESTAMP WITHOUT TIME ZONE, 
	update_user VARCHAR(60), 
	update_timestamp TIMESTAMP WITHOUT TIME ZONE, 

    FOREIGN KEY (permit_amendment_guid) REFERENCES permit_amendment(permit_amendment_guid)
    FOREIGN KEY (permit_amendment_document_guid) REFERENCES permit_amendment_document(permit_amendment_document_guid)
);

CREATE INDEX IF NOT EXISTS permit_extraction_task_id_idx ON permit_extraction_task (task_id);
CREATE INDEX IF NOT EXISTS permit_extraction_amend_guid_idx ON permit_extraction_task (permit_amendment_guid);