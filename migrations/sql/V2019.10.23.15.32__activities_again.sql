ALTER TABLE blasting_operation DROP COLUMN activity_summary_id;
ALTER TABLE blasting_operation ADD COLUMN now_application_id integer primary key;
ALTER TABLE blasting_operation ADD FOREIGN KEY (now_application_id) REFERENCES now_application(now_application_id);

DROP TABLE water_supply_detail;

ALTER TABLE water_supply DROP COLUMN activity_summary_id;
ALTER TABLE water_supply ADD COLUMN now_application_id integer primary key;
ALTER TABLE water_supply ADD FOREIGN KEY (now_application_id) REFERENCES now_application(now_application_id);