ALTER TABLE party ADD COLUMN address_id integer;
ALTER TABLE party ADD CONSTRAINT party_address_id_fkey
    FOREIGN KEY (address_id)
    REFERENCES address(address_id);

UPDATE party party_table SET address_id = (select pax.address_id from party p inner join party_address_xref pax p.party_guid = pax.party_guid where p.party_id = party_table.party_id);

DROP TABLE party_address_xref;