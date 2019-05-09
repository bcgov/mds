ALTER TABLE variance
ADD COLUMN variance_guid uuid DEFAULT gen_random_uuid() NOT NULL UNIQUE;
