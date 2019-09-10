DELETE FROM party_address_xref 
WHERE address_id = ANY (SELECT address_id FROM address
WHERE suite_no IS NULL AND
  address_line_1 IS NULL AND
  address_line_2 IS NULL AND
  city              IS NULL AND
  sub_division_code IS NULL AND
  post_code   IS NULL);

DELETE FROM address WHERE
  suite_no IS NULL AND
  address_line_1 IS NULL AND
  address_line_2 IS NULL AND
  city              IS NULL AND
  sub_division_code IS NULL AND
  post_code   IS NULL;

-- remove existing date overlap constraint
ALTER TABLE mine_party_appt DROP CONSTRAINT mine_party_appt_mine_guid_daterange_excl;

-- only constrain non-deleted contacts
ALTER TABLE mine_party_appt ADD EXCLUDE USING gist ((mine_guid::text) WITH =, daterange(start_date,end_date,'[]') 
WITH &&) WHERE ( mine_party_appt_type_code = 'MMG' AND NOT deleted_ind);