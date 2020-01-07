-- ALTER TABLE underground_exploration
-- DROP COLUMN underground_exploration_type_code;

-- ALTER TABLE underground_exploration_detail
-- ADD COLUMN underground_exploration_type_code character varying(3) NOT NULL;
-- ALTER TABLE underground_exploration_detail ADD FOREIGN KEY (underground_exploration_type_code) REFERENCES underground_exploration_type(underground_exploration_type_code);