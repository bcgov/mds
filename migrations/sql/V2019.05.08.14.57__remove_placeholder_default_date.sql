-- mine_location expiry_date
ALTER TABLE mine_location
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

UPDATE mine_location
SET expiry_date = NULL
WHERE expiry_date = '9999-12-31'::date;

-- permit_status_code expiry_date
ALTER TABLE permit_status_code
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

UPDATE permit_status_code
SET expiry_date = NULL
WHERE expiry_date = '9999-12-31'::date;

-- party_type_code expiry_date
ALTER TABLE party_type_code
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

UPDATE party_type_code
SET expiry_date = NULL
WHERE expiry_date = '9999-12-31'::date;

-- party expiry_date
ALTER TABLE party
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

UPDATE party
SET expiry_date = NULL
WHERE expiry_date = '9999-12-31'::date;

-- mineral_tenure_xref expiry_date
ALTER TABLE mineral_tenure_xref
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

UPDATE mineral_tenure_xref
SET expiry_date = NULL
WHERE expiry_date = '9999-12-31'::date;

-- mine_status expiry_date
ALTER TABLE mine_status
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

UPDATE mine_status
SET expiry_date = NULL
WHERE expiry_date = '9999-12-31'::date;

-- mine_region_code expiry_date
ALTER TABLE mine_region_code
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

UPDATE mine_region_code
SET expiry_date = NULL
WHERE expiry_date = '9999-12-31'::date;

-- article_act_code expiry_date
ALTER TABLE article_act_code
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

UPDATE article_act_code
SET expiry_date = NULL
WHERE expiry_date = '9999-12-31'::date;

COMMENT ON COLUMN article_act_code.expiry_date IS 'Expiry Date reflects the legal date an Act or Regulation is no longer valid. NULL implies the code value is still valid.';

-- variance
COMMENT ON COLUMN variance.expiry_date IS 'Expiry Date reflects the legal date a variance is no longer valid. NULL implies the variance is still valid.';
