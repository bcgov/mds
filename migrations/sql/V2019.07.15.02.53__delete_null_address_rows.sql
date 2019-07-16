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
