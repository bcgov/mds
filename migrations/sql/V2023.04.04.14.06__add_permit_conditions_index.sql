ALTER TABLE now_application_document_xref ADD PRIMARY KEY (now_application_document_xref_guid);
ALTER TABLE mine_incident_document_xref ADD PRIMARY KEY (mine_incident_document_xref_guid);
ALTER TABLE mine_party_appt_document_xref ADD PRIMARY KEY (mine_party_appt_document_xref_guid);
ALTER TABLE variance_document_xref ADD PRIMARY KEY (variance_document_xref_guid);
CREATE INDEX permit_conditions_permit_amendment_idx ON permit_conditions USING btree (permit_amendment_id);