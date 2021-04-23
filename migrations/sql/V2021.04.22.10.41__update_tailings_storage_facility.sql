ALTER TABLE mine_tailings_storage_facility
ADD COLUMN IF NOT EXISTS latitude                  numeric(9,7),
ADD COLUMN IF NOT EXISTS longitude                 numeric(11,7),
ADD COLUMN IF NOT EXISTS has_itrb                  boolean,
ADD COLUMN IF NOT EXISTS operating_status          varchar(3),
ADD COLUMN IF NOT EXISTS risk_classification       varchar(3);
