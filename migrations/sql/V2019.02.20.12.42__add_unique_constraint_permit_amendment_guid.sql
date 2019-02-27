ALTER TABLE permit_amendment ADD CONSTRAINT permit_amendment_guid_unique UNIQUE (permit_amendment_guid);
ALTER TABLE permit_amendment alter column permit_amendment_type_code drop default;
ALTER TABLE permit_amendment alter column permit_amendment_status_code drop default;