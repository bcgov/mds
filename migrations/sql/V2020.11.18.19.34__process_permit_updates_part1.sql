ALTER TABLE now_application ADD COLUMN security_not_required boolean;
ALTER TABLE permit_amendment ADD COLUMN security_not_required boolean;
ALTER TABLE now_application ADD COLUMN security_not_required_reason varchar;
ALTER TABLE permit_amendment ADD COLUMN security_not_required_reason varchar;
ALTER TABLE permit ADD COLUMN is_exploration boolean DEFAULT false;
