ALTER TABLE mine_type ADD COLUMN IF NOT EXISTS permit_guid uuid;

ALTER TABLE ONLY permit ADD CONSTRAINT permit_guid_unique UNIQUE (permit_guid);

ALTER TABLE ONLY mine_type ADD CONSTRAINT permit_guid_mine_type_fkey FOREIGN KEY (permit_guid) REFERENCES permit(permit_guid);