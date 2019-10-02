ALTER TABLE address ADD COLUMN party_guid integer;
ALTER TABLE address ADD CONSTRAINT address_party_guid_fkey
    FOREIGN KEY (party_guid)
    REFERENCES party(party_guid);

UPDATE address address_table SET party_guid = (select pax.party_guid from address a inner join party_address_xref pax on a.address_id = pax.address_id where a.address_id = address_table.address_id LIMIT 1);

DROP TABLE party_address_xref;  