ALTER TABLE permit ADD COLUMN is_exploration boolean DEFAULT false;
UPDATE permit set is_exploration = true where permit_no like '%X-%';
