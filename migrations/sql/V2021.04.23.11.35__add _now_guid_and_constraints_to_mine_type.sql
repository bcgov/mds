ALTER TABLE mine_type ADD COLUMN IF NOT EXISTS now_application_guid uuid;

ALTER TABLE ONLY mine_type ADD CONSTRAINT now_application_guid_mine_type_fkey FOREIGN KEY (now_application_guid) REFERENCES now_application_identity(now_application_guid);

DROP INDEX IF EXISTS mine_guid_mine_tenure_type_code_permit_guid_active_uniqeness;
ALTER TABLE mine_type ALTER COLUMN permit_guid DROP NOT NULL;

CREATE UNIQUE INDEX mine_guid_mine_tenure_type_code_permit_guid_active_uniqeness ON mine_type USING btree (mine_guid, mine_tenure_type_code, permit_guid, active_ind) WHERE (active_ind = true and permit_guid is not null);

CREATE UNIQUE INDEX mine_guid_mine_tenure_type_code_now_application_guid_active_uniqeness ON mine_type USING btree (mine_guid, mine_tenure_type_code, now_application_guid, active_ind) WHERE (active_ind = true and now_application_guid is not null);

ALTER TABLE ONLY mine_type ADD CONSTRAINT check_permit_guid_or_now_application_guid_is_not_null CHECK((now_application_guid IS NOT NULL)::integer + (permit_guid IS NOT NULL)::integer <= 1)