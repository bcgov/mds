ALTER TABLE permit_condition_category
    ADD COLUMN user_sub VARCHAR,
ADD CONSTRAINT fk_permit_condition_category_user FOREIGN KEY (user_sub)
    REFERENCES "user" (sub) ON DELETE SET NULL ON UPDATE CASCADE;

COMMENT ON COLUMN permit_condition_category.user_sub IS 'The user assigned to this permit condition category to review it';

ALTER TABLE permit_condition_category_version
    ADD COLUMN user_sub VARCHAR,
ADD CONSTRAINT fk_permit_condition_category_version_user FOREIGN KEY (user_sub)
    REFERENCES "user" (sub) ON DELETE SET NULL ON UPDATE CASCADE;