ALTER TABLE project_summary
    ADD COLUMN IF NOT EXISTS agent_party_guid uuid,
    ADD COLUMN IF NOT EXISTS is_agent boolean;

UPDATE project_summary SET is_agent = False;

ALTER TABLE project_summary
    ADD CONSTRAINT project_summary_agent_party_guid_fkey
        FOREIGN KEY (agent_party_guid) REFERENCES party(party_guid);
