CREATE TABLE IF NOT EXISTS project_summary_authorization_document_xref (
    project_summary_authorization_document_xref_guid          uuid DEFAULT gen_random_uuid()          PRIMARY KEY,
    mine_document_guid                                        uuid                                    NOT NULL,
    project_summary_authorization_guid                        uuid                                    NOT NULL,
    project_summary_document_type_code                        character varying(3)                    NOT NULL,

    CONSTRAINT project_summary_authorization_document_xref_guid UNIQUE (project_summary_authorization_document_xref_guid),
    CONSTRAINT mine_document_guid_fkey FOREIGN KEY (mine_document_guid) REFERENCES mine_document(mine_document_guid) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT project_summary_authorization_guid_fkey FOREIGN KEY (project_summary_authorization_guid) REFERENCES project_summary_authorization(project_summary_authorization_guid) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT project_summary_document_type_code_fkey FOREIGN KEY (project_summary_document_type_code) REFERENCES project_summary_document_type(project_summary_document_type_code) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE project_summary_document_xref is 'Links mine documents to project summaries authorizations.';
ALTER TABLE project_summary_authorization_document_xref OWNER TO mds;


INSERT INTO 
project_summary_document_type(project_summary_document_type_code, description, display_order, active_ind, create_user, update_user)
VALUES 
('MAP', 'Location Map', 20, TRUE, 'system-mds', 'system-mds'),
('DFA', 'Discharge Factor Amendment', 25, TRUE, 'system-mds', 'system-mds'),
('SPR', 'Supporting Documents', 30, TRUE, 'system-mds', 'system-mds');
