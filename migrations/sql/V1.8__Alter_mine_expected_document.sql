
ALTER TABLE mine_expected_document
    ADD received_date date NULL
,
ADD exp_document_status_guid uuid NULL,
ADD FOREIGN KEY
(exp_document_status_guid) REFERENCES mine_expected_document_status
(exp_document_status_guid) DEFERRABLE INITIALLY DEFERRED
;