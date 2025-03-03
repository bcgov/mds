CREATE TABLE IF NOT EXISTS permit_condition_review_assignment (
    condition_review_assignment_guid UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    permit_amendment_id INTEGER NOT NULL,
    condition_category_code VARCHAR NOT NULL, 
    user_sub VARCHAR,
    create_user VARCHAR(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user VARCHAR(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    deleted_ind BOOLEAN DEFAULT false NOT NULL
);

ALTER TABLE permit_condition_review_assignment ADD CONSTRAINT condition_review_permit_amendment_id_fkey 
    FOREIGN KEY (permit_amendment_id) REFERENCES permit_amendment(permit_amendment_id); 
ALTER TABLE permit_condition_review_assignment ADD CONSTRAINT condition_review_condition_category_fkey 
    FOREIGN KEY (condition_category_code) REFERENCES permit_condition_category(condition_category_code);
ALTER TABLE permit_condition_review_assignment ADD CONSTRAINT condition_review_user_fkey 
    FOREIGN KEY (user_sub) REFERENCES "user"(sub);

ALTER TABLE permit_condition_category DROP COLUMN IF EXISTS user_sub;
ALTER TABLE permit_condition_category_version DROP COLUMN IF EXISTS user_sub;