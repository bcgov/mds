CREATE TABLE IF NOT EXISTS now_submissions.etl_placer_activity  (
  placeractivityid integer NOT NULL PRIMARY KEY, 
  activity_detail_id integer NOT NULL
);
ALTER TABLE now_submissions.etl_placer_activity OWNER TO mds;

CREATE TABLE IF NOT EXISTS now_submissions.etl_settling_pond  (
  settlingpondid integer NOT NULL PRIMARY KEY, 
  activity_detail_id integer NOT NULL
);
ALTER TABLE now_submissions.etl_settling_pond OWNER TO mds;

ALTER TABLE activity_summary_detail_xref ADD COLUMN is_existing boolean;