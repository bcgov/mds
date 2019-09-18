CREATE TABLE IF NOT EXISTS mine_party_appt_document_xref
(
    mine_party_appt_document_xref_guid uuid    DEFAULT gen_random_uuid() NOT NULL,
    mine_document_guid                 uuid                              NOT NULL,
    mine_party_appt_id                 integer                           NOT NULL
);

-- Constraints
ALTER TABLE ONLY mine_party_appt_document_xref
    ADD CONSTRAINT mine_party_appt_document_xref_mine_document_guid_fkey FOREIGN KEY (mine_document_guid) REFERENCES mine_document(mine_document_guid),
    ADD CONSTRAINT mine_party_appt_document_xref_mine_party_appt_id_fkey FOREIGN KEY (mine_party_appt_id) REFERENCES mine_party_appt(mine_party_appt_id);
