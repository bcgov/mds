ALTER TABLE mine_type ADD COLUMN IF NOT EXISTS permit_guid uuid;

ALTER TABLE ONLY permit ADD CONSTRAINT permit_guid_unique UNIQUE (permit_guid);

ALTER TABLE ONLY mine_type ADD CONSTRAINT permit_guid_mine_type_fkey FOREIGN KEY (permit_guid) REFERENCES permit(permit_guid);

DROP INDEX if exists mine_guid_mine_tenure_type_code_active_uniqeness;

CREATE UNIQUE INDEX mine_guid_mine_tenure_type_code_permit_guid_active_uniqeness ON mine_type USING btree (mine_guid, mine_tenure_type_code, permit_guid, active_ind) WHERE (active_ind = true);