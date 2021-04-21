ALTER TABLE ONLY core_user ADD CONSTRAINT core_user_guid_unique UNIQUE (core_user_guid);

CREATE TABLE IF NOT EXISTS core_activity_subscription (
	core_user_guid uuid,
	target_guid uuid,
	create_user varchar NOT NULL,
	create_timestamp timestamptz(0) NOT NULL,
	update_user varchar NOT NULL,
	update_timestamp timestamptz(0) NOT NULL,
	PRIMARY KEY (core_user_guid, target_guid)
);

ALTER TABLE ONLY core_activity_subscription
    ADD CONSTRAINT core_activity_subscription_core_user_guid_fkey FOREIGN KEY (core_user_guid) REFERENCES core_user(core_user_guid) DEFERRABLE INITIALLY DEFERRED;