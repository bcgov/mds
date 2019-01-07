-- SRID=3005 is ‘BC Albers’ projection, chosen as the standard projection for this application.
ALTER TABLE mine_location ADD COLUMN location_pnt GEOMETRY(POINT, 3005);
UPDATE mine_location SET location_pnt = ST_SetSRID(ST_MakePoint(longitude, latitude),3005) WHERE longitude IS NOT NULL AND latitude IS NOT NULL;
CREATE INDEX mine_location_location_pnt_idx ON mine_location USING GIST(location_pnt);
DROP INDEX IF EXISTS mine_location_geom_idx;
ALTER TABLE mine_location DROP COLUMN geom;