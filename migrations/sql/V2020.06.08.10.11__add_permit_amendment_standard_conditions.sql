ALTER TABLE standard_permit_conditions
    ADD COLUMN permit_amendment_id integer,
    ADD CONSTRAINT permit_amendment_id FOREIGN KEY (permit_amendment_id) REFERENCES permit_amendment(permit_amendment_id) DEFERRABLE INITIALLY DEFERRED;