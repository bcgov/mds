CREATE TABLE IF NOT EXISTS etl_activity_detail  (
  activity_detail_id integer PRIMARY KEY REFERENCES activity_detail(activity_detail_id),
  placeractivityid integer, 
  settlingpondid integer
);
ALTER TABLE etl_activity_detail OWNER TO mds;

ALTER TABLE activity_summary_detail_xref ADD COLUMN is_existing boolean;