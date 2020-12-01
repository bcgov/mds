-- Change name from security_adjustment to liability_adjustment
ALTER TABLE now_application RENAME COLUMN security_adjustment TO liability_adjustment;
ALTER TABLE permit_amendment RENAME COLUMN security_adjustment TO liability_adjustment;

-- Add static remaining liability to permit
ALTER TABLE permit ADD COLUMN remaining_static_liability NUMERIC(16, 2);
