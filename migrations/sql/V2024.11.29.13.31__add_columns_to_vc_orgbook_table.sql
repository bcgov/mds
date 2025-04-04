ALTER TABLE permit_amendment_orgbook_publish_status 
    ADD COLUMN IF NOT EXISTS permit_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS orgbook_entity_id VARCHAR(50),
    ADD COLUMN IF NOT EXISTS error_msg VARCHAR;