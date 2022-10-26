ALTER TABLE sub_division_code 
ADD address_type_code character varying NOT NULL DEFAULT 'CAN'::character varying REFERENCES address_type_code(address_type_code);

UPDATE sub_division_code SET address_type_code = 'USA'
WHERE display_order > 130;