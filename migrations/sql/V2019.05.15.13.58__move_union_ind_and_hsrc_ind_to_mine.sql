ALTER TABLE variance
DROP COLUMN union_ind,
DROP COLUMN ohsc_ind;

ALTER TABLE mine
ADD COLUMN union_ind boolean DEFAULT FALSE NOT NULL,
ADD COLUMN ohsc_ind  boolean DEFAULT FALSE NOT NULL;

COMMENT ON COLUMN mine.union_ind IS 'Indicates if the mine has a union.';
COMMENT ON COLUMN mine.ohsc_ind IS 'Indicates if the mine has an OHSC.';
