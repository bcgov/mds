ALTER TABLE explosives_permit_amendment
    ADD COLUMN IF NOT EXISTS explosives_permit_guid uuid; 
    
UPDATE explosives_permit_amendment
    SET explosives_permit_guid = 
        (SELECT explosives_permit_guid FROM explosives_permit 
            WHERE explosives_permit.explosives_permit_id = explosives_permit_amendment.explosives_permit_id); 
    
ALTER TABLE ONLY explosives_permit_amendment
    ADD CONSTRAINT esup_amendment_esup_guid_fkey 
        FOREIGN KEY (explosives_permit_guid) REFERENCES explosives_permit(explosives_permit_guid);

ALTER TABLE ONLY explosives_permit_amendment
    ALTER COLUMN explosives_permit_guid SET NOT NULL;
