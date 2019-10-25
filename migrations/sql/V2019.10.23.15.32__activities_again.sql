ALTER TABLE blasting_operation DROP COLUMN activity_summary_id;
ALTER TABLE blasting_operation ADD COLUMN now_application_id integer primary key;
ALTER TABLE blasting_operation ADD FOREIGN KEY (now_application_id) REFERENCES now_application(now_application_id);

ALTER TABLE underground_exploration DROP COLUMN underground_exploration_type_code;
ALTER TABLE underground_exploration ADD COLUMN underground_exploration_type_code varchar(3);
ALTER TABLE underground_exploration ADD FOREIGN KEY (underground_exploration_type_code) REFERENCES underground_exploration_type(underground_exploration_type_code);

ALTER TABLE activity_detail ADD COLUMN height integer;

CREATE TABLE IF NOT EXISTS underground_exploration_detail  (
  activity_detail_id    integer PRIMARY KEY, 
  underground_exploration_type_code varchar(3),

  
  FOREIGN KEY (activity_detail_id) REFERENCES activity_detail(activity_detail_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (underground_exploration_type_code) REFERENCES underground_exploration_type(underground_exploration_type_code)
  DEFERRABLE INITIALLY DEFERRED
);
ALTER TABLE underground_exploration_detail OWNER TO mds;
