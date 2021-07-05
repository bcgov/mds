ALTER TABLE explosives_permit 
ADD COLUMN IF NOT EXISTS description varchar;

ALTER TABLE explosives_permit_magazine 
ADD COLUMN IF NOT EXISTS detonator_type varchar;
