-- -- Rename regional_contact_type and PK
-- ALTER TABLE regional_contact_type
-- RENAME TO emli_contact_type; 

-- COMMENT ON TABLE emli_contact_type IS 'The types of EMLI contacts.';

-- ALTER TABLE emli_contact_type
--   RENAME regional_contact_type_code TO emli_contact_type_code;

-- ALTER TABLE emli_contact_type 
--   RENAME CONSTRAINT regional_contact_type_pkey TO emli_contact_type_pkey;
