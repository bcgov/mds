-- TODO
-- mine_location expiry_date
ALTER TABLE mine_location
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

-- permit_status_code expiry_date
ALTER TABLE permit_status_code
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

-- party_type_code expiry_date
ALTER TABLE party_type_code
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

-- party expiry_date
ALTER TABLE party
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

-- mineral_tenure_xref expiry_date
ALTER TABLE mineral_tenure_xref
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

-- mine_status expiry_date
ALTER TABLE mine_status
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

-- mine_region_code expiry_date
ALTER TABLE mine_region_code
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

-- This one has comments that say 9999-12-31 implies that the code is still valid. Comments will need to be updated, and there may be FE changes that need to be made to use NULL as the infinite end
-- article_act_code expiry_date
ALTER TABLE article_act_code
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP DEFAULT;

-- variance also has a 9999 comment
