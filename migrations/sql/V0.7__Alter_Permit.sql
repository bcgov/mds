ALTER TABLE permit RENAME approved_date TO issue_date;
ALTER TABLE permit ADD COLUMN expiry_date date NOT NULL DEFAULT '9999-12-31'::date;
