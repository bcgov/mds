ALTER TABLE IF EXISTS mine_incident_category
ADD COLUMN IF NOT EXISTS is_historic BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS parent_mine_incident_category_code VARCHAR(3),
ADD CONSTRAINT mine_incident_category_parent_mine_incident_category_code_fk FOREIGN KEY (parent_mine_incident_category_code) REFERENCES mine_incident_category(mine_incident_category_code);
