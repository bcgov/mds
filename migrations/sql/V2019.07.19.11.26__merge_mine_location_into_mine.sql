-- Create new columns in mine
ALTER TABLE mine
ADD COLUMN IF NOT EXISTS latitude                  numeric(9,7),
ADD COLUMN IF NOT EXISTS longitude                 numeric(11,7),
ADD COLUMN IF NOT EXISTS mine_location_description character varying,
ADD COLUMN IF NOT EXISTS geom                      geometry(Point,3005);

-- Migrate mine_location data
UPDATE mine
    SET latitude                  = mine_location.latitude,
        longitude                 = mine_location.longitude,
        mine_location_description = mine_location.mine_location_description,
        geom                      = mine_location.geom
FROM mine_location
WHERE mine.mine_guid = mine_location.mine_guid;

-- Destroy mine_location
DROP TABLE IF EXISTS mine_location CASCADE;
